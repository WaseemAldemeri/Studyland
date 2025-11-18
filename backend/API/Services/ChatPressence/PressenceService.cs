using System.Collections.Concurrent;
using Dtos.Users;
using Microsoft.AspNetCore.SignalR;

namespace API.Services.ChatPressence;


public class PressenceService(IServiceScopeFactory scopeFactory)
{
    private record Connection(Guid ChannelId, Guid UserId);

    private readonly ConcurrentDictionary<string, Connection> _connectionMap = new();
    private readonly ConcurrentDictionary<Guid, ConcurrentBag<string>> _usersConnections = new();
    private readonly ConcurrentDictionary<Guid, ChannelPressence> _channels = new();

    private ChannelPressence GetChannel(Guid channelId) =>
        _channels.GetOrAdd(channelId, new ChannelPressence(scopeFactory, channelId));

    public ChannelPressence GetChannelFromConnectionId(string connectionId)
    {
        _connectionMap.TryGetValue(connectionId, out var connection);
        return GetChannel(connection?.ChannelId ?? throw new HubException("User is not in a channel"));
    }

    public async Task<UserPressenceDto> AddConnection(Guid channelId, string connectionId, Guid userId)
    {
        _connectionMap.TryAdd(connectionId, new Connection(channelId, userId));
        var connections = _usersConnections.GetOrAdd(userId, []);
        connections.Add(connectionId);

        return await GetChannel(channelId).AddUser(userId);
    }

    public async Task<UserPressenceDto?> RemoveConnection(string connectionId)
    {
        if (!_connectionMap.TryRemove(connectionId, out var connection))
        {
            return null;
        }

        if (_usersConnections.TryGetValue(connection.UserId, out var userConnections))
        {
            ConcurrentBag<string> newConnections = [.. userConnections.Where(cId => cId != connectionId)];
            _usersConnections[connection.UserId] = newConnections;

            // only remove users from channel if no connection left points at it (ie orphaned)
            if (!newConnections.IsEmpty) return null;

            var channel = GetChannel(connection.ChannelId);
            var userPressense = await channel.RemoveUser(connection.UserId);

            if (channel.IsEmpty)
            {
                // this to free the memory to get cleaned by gc
                _channels.TryRemove(channel.Id, out _);
            }

            return userPressense;
        }
        
        return null;
    }
    
    // returns the modified channels to notify the chathub to send updates
    public async Task<List<ChannelPressence>> KillAllZombiSessions(TimeSpan timeLimit)
    {
        List<ChannelPressence> modifiedChannels = [];

        var zombieUsers = _usersConnections
            .Where(kvp => kvp.Value.IsEmpty)
            .Select(kvp => kvp.Key)
            .ToHashSet();
        
        foreach (var channel in _channels)
        {
            bool killedSessions = await channel.Value.KillZombieSessionsFor(zombieUsers, timeLimit);
            
            if (killedSessions)
            {
                modifiedChannels.Add(channel.Value);
            }
        }
        
        return modifiedChannels;
    }
}
