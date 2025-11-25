using System.Security.Claims;
using API.Services.ChatPressence;
using Application.ChatMessages.Commands;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace API.SignalR;


[Authorize]
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
        // we assign first because current group depends on the user data in the channel
        var currentChannelId = CurrentChannel.Id;

        var userPressence = await pressenceService.RemoveConnection(Context.ConnectionId);

        await Clients.Groups(currentChannelId.ToString()).SendAsync(ChatHubEvents.UserLeftChannel, userPressence);
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

    public async Task StartStudying(Guid topicId, int? pomodoroDurationMinutes = null, int? nextBreakDurationMinutes = null)
    {
        var userPressense = await CurrentChannel.StartUserStudying(
            CurrentUserId,
            topicId,
            pomodoroDurationMinutes,
            nextBreakDurationMinutes
        );

        await CurrentGroup.SendAsync(ChatHubEvents.UserStartedStudying, userPressense);
    }

    public async Task StopStudying()
    {
        var userPressense = await CurrentChannel.StopUserStudying(CurrentUserId);
        await CurrentGroup.SendAsync(ChatHubEvents.UserStoppedStudying, userPressense);
    }

    public async Task StartBreak(int durationMinutes)
    {
        var userPressense = await CurrentChannel.StartUserBreak(CurrentUserId, durationMinutes);
        await CurrentGroup.SendAsync(ChatHubEvents.UserStartedBreak, userPressense);
    }
    
    public async Task StopBreak()
    {
        var userPressense = await CurrentChannel.StopUserBreak(CurrentUserId);
        await CurrentGroup.SendAsync(ChatHubEvents.UserStoppedBreak, userPressense);
    }

    public async Task GetPressenceList()
    {
        await Clients.Caller.SendAsync(ChatHubEvents.RecievePressenceList, CurrentChannel.Users);
    }
}