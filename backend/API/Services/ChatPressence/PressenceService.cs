using System.Collections.Concurrent;
using AutoMapper;
using MediatR;
using Microsoft.AspNetCore.SignalR;
using Persistence;

namespace API.Services.ChatPressence;


public class PressenceService(AppDbContext context, IMediator mediator, IMapper mapper)
{
    private record Connection(Guid ChannelId, Guid UserId);

    private readonly ConcurrentDictionary<string, Connection> _connectionMap = new();

    private readonly ConcurrentDictionary<Guid, ChannelPressence>
        _channels = new();

    private ChannelPressence GetChannel(Guid channelId) =>
        _channels.GetOrAdd(channelId, new ChannelPressence(context, mediator, mapper, channelId));

    public ChannelPressence GetChannelFromConnectionId(string connectionId)
    {
        _connectionMap.TryGetValue(connectionId, out var connection);
        return GetChannel(connection?.ChannelId ?? throw new HubException("User is not in a channel"));
    }

    public async Task<UserPressenceDto> AddConnection(Guid channelId, string connectionId, Guid userId)
    {
        _connectionMap.TryAdd(connectionId, new Connection(channelId, userId));
        return await GetChannel(channelId).AddUser(userId);
    }

    public async Task RemoveConnection(string connectionId)
    {
        if (_connectionMap.TryGetValue(connectionId, out var connection))
        {
            var channel = GetChannel(connection.ChannelId);
            await channel.RemoveUser(connection.UserId);

            if (channel.IsEmpty)
            {
                // this to free the memory to get cleaned by gc
                _channels.TryRemove(channel.Id, out _);
            }
        }
    }
}
