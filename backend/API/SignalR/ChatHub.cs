using System.Security.Claims;
using API.Services.ChatPressence;
using Application.ChatMessages.Commands;
using MediatR;
using Microsoft.AspNetCore.SignalR;

namespace API.SignalR;


public class ChatHub(IMediator mediator, PressenceService pressenceService) : Hub, IChatHub
{

    private Guid CurrentUserId => Guid.Parse(
        Context.User?.FindFirstValue(ClaimTypes.NameIdentifier) ?? Guid.Empty.ToString()
    );

    private ChannelPressence CurrentChannel =>
        pressenceService.GetChannelFromConnectionId(Context.ConnectionId);

    private IClientProxy CurrentGroup => Clients.Groups(CurrentChannel.Id.ToString());


    public async Task JoinChannel(Guid channelId)
    {
        var userPressense = await pressenceService.AddConnection(channelId, Context.ConnectionId, CurrentUserId);
        await Groups.AddToGroupAsync(Context.ConnectionId, channelId.ToString());

        await CurrentGroup.SendAsync(ChatHubEvents.UserJoinedChannel, userPressense);
        await Clients.Caller.SendAsync(ChatHubEvents.RecievePressenceList, CurrentChannel.Users);
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await CurrentGroup.SendAsync(ChatHubEvents.UserLeftChannel, CurrentUserId);
        // we remove after because current group depends on the user data in the channel
        await pressenceService.RemoveConnection(Context.ConnectionId);
    }

    public async Task SendMessage(string messageContent)
    {
        var command = new CreateChatMessage.Query()
        {
            ChannelId = CurrentChannel.Id,
            UserId = CurrentUserId,
            Content = messageContent
        };

        var message = await mediator.Send(command);

        await CurrentGroup.SendAsync(ChatHubEvents.ReceiveMessage, message);
    }

    public async Task StartStudying(Guid topicId)
    {
        var userPressense = await CurrentChannel.StartUserStudying(CurrentUserId, topicId);
        await CurrentGroup.SendAsync(ChatHubEvents.UserStartedStudying, userPressense);
    }

    public async Task StopStudying()
    {
        var userPressense = await CurrentChannel.StopUserStudying(CurrentUserId);
        await CurrentGroup.SendAsync(ChatHubEvents.UserStoppedStudying, userPressense);
    }
}