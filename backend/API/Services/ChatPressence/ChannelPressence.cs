using System.Collections.Concurrent;
using Application.Sessions.Commands;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Dtos.Topics;
using Dtos.Users;
using MediatR;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Persistence;

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

        if (userPresence.Status == PressenceStatus.STUDYING)
        {
            // we do not remove the user from the channel, we will keep them as studying
            return userPresence;
        }

        // _users.Remove(userId, out userPresence);
        // we are not removing them entirley instead keep them as offline
        // acting as a cache, but we need to make endpoints that mutate the user
        // to invalidate this cache or just a time to live which will be simpler

        userPresence.Status = PressenceStatus.OFFLINE;

        return userPresence;
    }


    public async Task<UserPressenceDto> StartUserStudying(Guid userId, Guid topicId)
    {
        var userPressense = await GetUserPressense(userId);
        if (userPressense.Status == PressenceStatus.STUDYING) return userPressense;

        using var scope = scopeFactory.CreateScope();
        var context = GetContext(scope);
        var mapper = GetMapper(scope);

        userPressense.Status = PressenceStatus.STUDYING;
        userPressense.StartedAt = DateTimeOffset.UtcNow;
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

        userPressense.Status = PressenceStatus.ONLINE;
        userPressense.StartedAt = DateTimeOffset.UtcNow;
        userPressense.Topic = null;

        return userPressense;
    }
    
    public async Task<bool> KillZombieSessionsFor(HashSet<Guid> zombieUsers, TimeSpan timeLimit)
    {
        bool killedSessions = false;

        var studyingUsersInChannel = _users
            .Where(kvp => kvp.Value.Status == PressenceStatus.STUDYING)
            .Select(kvp => kvp.Key);

        foreach (var userId in studyingUsersInChannel)
        {
            if (!zombieUsers.Contains(userId)) continue;

            var userPresence = await GetUserPressense(userId);
            
            var duration = DateTimeOffset.UtcNow - userPresence.StartedAt;

            if (duration > timeLimit)
            {
                userPresence.Status = PressenceStatus.OFFLINE;
                userPresence.Topic = null;
                userPresence.StartedAt = DateTimeOffset.UtcNow;
                
                killedSessions = true;
            }
        }
        
        return killedSessions;
    }
}