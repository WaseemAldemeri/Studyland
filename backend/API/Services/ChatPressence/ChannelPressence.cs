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
            return userPressense;
        }

        using var scope = scopeFactory.CreateScope();
        var context = GetContext(scope);
        var mapper = GetMapper(scope);

        return _users.GetOrAdd(userId, new UserPressenceDto()
        {
            User = await context.Users.ProjectTo<UserDto>(mapper.ConfigurationProvider)
                .FirstOrDefaultAsync(u => u.Id == userId)
                ?? throw new HubException("Can't Find User"),
        });
    }

    public async Task<UserPressenceDto> AddUser(Guid userId)
    {
        return await GetUserPressense(userId);
    }

    public async Task RemoveUser(Guid userId)
    {

        if ((await GetUserPressense(userId)).Status == PressenceStatus.STUDYING)
        {
            await StopUserStudying(userId);
        }
        _users.Remove(userId, out var _);
    }


    public async Task<UserPressenceDto> StartUserStudying(Guid userId, Guid topicId)
    {
        var userPressense = await GetUserPressense(userId);
        if (userPressense.Status == PressenceStatus.STUDYING) return userPressense;

        using var scope = scopeFactory.CreateScope();
        var context = GetContext(scope);
        var mapper = GetMapper(scope);

        userPressense.Status = PressenceStatus.STUDYING;
        userPressense.StartedAt = DateTimeOffset.Now;
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
            Duration = TimeSpan.FromTicks(DateTimeOffset.Now.Ticks - userPressense.StartedAt.Ticks)
        };

        using var scope = scopeFactory.CreateScope();
        var mediator = GetMediator(scope);

        await mediator.Send(command);

        userPressense.Status = PressenceStatus.ONLINE;
        userPressense.StartedAt = DateTimeOffset.Now;
        userPressense.Topic = null;

        return userPressense;
    }
}