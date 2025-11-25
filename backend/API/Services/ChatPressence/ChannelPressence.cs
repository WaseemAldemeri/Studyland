using System.Collections.Concurrent;
using API.SignalR;
using Application.Sessions.Commands;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Dtos.Topics;
using Dtos.Users;
using MediatR;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Persistence;
using static API.Services.ChatPressence.PressenceService;

namespace API.Services.ChatPressence;

public class ChannelPressence(IServiceScopeFactory scopeFactory, Guid channelId)
{
    private readonly ConcurrentDictionary<Guid, UserPressenceDto> _users = new();
    public Guid Id { get; set; } = channelId;

    public bool IsEmpty => _users.IsEmpty;
    public List<UserPressenceDto> Users => [.. _users.Select(kv => kv.Value)];

    private static IMediator GetMediator(IServiceScope scope) => scope.ServiceProvider.GetRequiredService<IMediator>();
    private static IMapper GetMapper(IServiceScope scope) => scope.ServiceProvider.GetRequiredService<IMapper>();
    private static AppDbContext GetContext(IServiceScope scope) => scope.ServiceProvider.GetRequiredService<AppDbContext>();

    private async Task<UserPressenceDto> GetUserPressense(Guid userId)
    {
        if (_users.TryGetValue(userId, out var userPressense))
        {
            if (userPressense.Status == PressenceStatus.OFFLINE)
            {
                userPressense.Status = PressenceStatus.ONLINE;
            }
            return userPressense;
        }

        // first time user joining we hit database
        using var scope = scopeFactory.CreateScope();
        var context = GetContext(scope);
        var mapper = GetMapper(scope);

        return _users.GetOrAdd(userId, new UserPressenceDto()
        {
            User = await context.Users.ProjectTo<UserDto>(mapper.ConfigurationProvider)
                .FirstOrDefaultAsync(u => u.Id == userId)
                ?? throw new HubException("Can't Find User"),
            Status = PressenceStatus.ONLINE
        });
    }

    public async Task<UserPressenceDto> AddUser(Guid userId)
    {
        return await GetUserPressense(userId);
    }

    public async Task<UserPressenceDto> RemoveUser(Guid userId)
    {
        var userPresence = await GetUserPressense(userId);

        if (userPresence.Status == PressenceStatus.STUDYING || userPresence.Status == PressenceStatus.ON_BREAK)
        {
            // we do not remove the user from the channel, we will keep them as studying / on break
            return userPresence;
        }

        // _users.Remove(userId, out userPresence);
        // we are not removing them entirley instead keep them as offline
        // acting as a cache, but we need to make endpoints that mutate the user
        // to invalidate this cache or just a time to live which will be simpler

        userPresence.Status = PressenceStatus.OFFLINE;

        return userPresence;
    }


    public async Task<UserPressenceDto> StartUserStudying(Guid userId, Guid topicId, int? pomodoroDurationMinutes = null, int? nextBreakDurationMinutes = null)
    {
        var userPressense = await GetUserPressense(userId);
        if (userPressense.Status == PressenceStatus.STUDYING) return userPressense;

        using var scope = scopeFactory.CreateScope();
        var context = GetContext(scope);
        var mapper = GetMapper(scope);

        userPressense.Status = PressenceStatus.STUDYING;
        userPressense.StartedAt = DateTimeOffset.UtcNow;
        userPressense.TimerDurationMinutes = pomodoroDurationMinutes;
        userPressense.NextBreakDurationMinutes = nextBreakDurationMinutes;
        userPressense.Topic = await context.Topics.ProjectTo<TopicDto>(mapper.ConfigurationProvider)
                .FirstOrDefaultAsync(t => t.Id == topicId)
                ?? throw new HubException("Can't Find Topic");

        return userPressense;
    }

    public async Task<UserPressenceDto> StopUserStudying(Guid userId)
    {
        var userPressense = await GetUserPressense(userId);
        if (userPressense.Status != PressenceStatus.STUDYING) throw new HubException("User is not studying");
        var command = new CreateSession.Command()
        {
            UserId = userId,
            StartedAt = userPressense.StartedAt,
            TopicId = userPressense.Topic!.Id,
            Duration = TimeSpan.FromTicks(DateTimeOffset.UtcNow.Ticks - userPressense.StartedAt.Ticks)
        };

        using var scope = scopeFactory.CreateScope();
        var mediator = GetMediator(scope);

        await mediator.Send(command);

        if (userPressense.NextBreakDurationMinutes is not null)
        {
            userPressense.Status = PressenceStatus.ON_BREAK;
            userPressense.TimerDurationMinutes = userPressense.NextBreakDurationMinutes;
            userPressense.NextBreakDurationMinutes = null;
        }
        else
        {
            userPressense.Status = PressenceStatus.ONLINE;
            userPressense.TimerDurationMinutes = null;
        }

        userPressense.StartedAt = DateTimeOffset.UtcNow;
        userPressense.Topic = null;

        return userPressense;
    }


    public async Task<UserPressenceDto> StartUserBreak(Guid userId, int durationMinutes)
    {
        var userPresence = await GetUserPressense(userId);

        if (userPresence.Status == PressenceStatus.STUDYING) await StopUserStudying(userId);

        userPresence.Status = PressenceStatus.ON_BREAK;
        userPresence.TimerDurationMinutes = durationMinutes;
        userPresence.NextBreakDurationMinutes = null;

        return userPresence;
    }

    public async Task<UserPressenceDto> StopUserBreak(Guid userId)
    {
        var userPresence = await GetUserPressense(userId);

        if (userPresence.Status != PressenceStatus.ON_BREAK) throw new HubException("User is not on a break");

        userPresence.Status = PressenceStatus.ONLINE;
        userPresence.TimerDurationMinutes = null;
        userPresence.NextBreakDurationMinutes = null;

        return userPresence;
    }

    public bool KillZombieSessionsForUsers(HashSet<Guid> zombieUsers, TimeSpan timeLimit)
    {
        bool killedSessions = false;

        var studyingOrOnlineUsersInChannel = _users
            .Where(kvp => kvp.Value.Status == PressenceStatus.STUDYING || kvp.Value.Status == PressenceStatus.ONLINE)
            .Select(kvp => kvp.Value)
            .ToList();

        foreach (var up in studyingOrOnlineUsersInChannel)
        {
            if (!zombieUsers.Contains(up.User.Id)) continue;

            var duration = DateTimeOffset.UtcNow - up.StartedAt;

            // users with no left connection and online should be set to offline
            // if studying, we check if they reached the time limit, if so, set them offline 
            // else we keep them studying
            if (duration > timeLimit || up.Status == PressenceStatus.ONLINE)
            {
                up.Status = PressenceStatus.OFFLINE;
                up.Topic = null;
                up.TimerDurationMinutes = null;
                up.NextBreakDurationMinutes = null;
                up.StartedAt = DateTimeOffset.UtcNow;

                killedSessions = true;
            }
        }

        return killedSessions;
    }


    public async Task<List<PresenceUpdateEvent>> CheckForExpiredTimers()
    {
        List<PresenceUpdateEvent> updatesList = [];

        var usersOnTimer = _users.Where(kvp => kvp.Value.TimerDurationMinutes is not null)
           .Select(kvp => kvp.Value)
           .ToList();

        foreach (var up in usersOnTimer)
        {
            var expired = (up.StartedAt.AddMinutes((double)up.TimerDurationMinutes!) - DateTimeOffset.UtcNow )
                < TimeSpan.Zero;

            if (!expired) continue;

            switch (up.Status)
            {
                case PressenceStatus.STUDYING:
                    var userPressence = await StopUserStudying(up.User.Id);
                    updatesList.Add(new (Id, ChatHubEvents.UserStartedBreak, userPressence));
                    break;

                case PressenceStatus.ON_BREAK:
                    var userPresence = await StopUserBreak(up.User.Id);
                    updatesList.Add(new (Id, ChatHubEvents.UserStoppedBreak, userPresence));
                    break;

                default:
                    up.TimerDurationMinutes = null;  // timer duration should be null for other states
                    continue;
            }
        }

        return updatesList;
    }
    
}