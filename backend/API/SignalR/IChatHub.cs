namespace API.SignalR;

public interface IChatHub
{
    Task JoinChannel(Guid channelId);
    Task SendMessage(string messageContent);
    Task StartStudying(Guid topicId);
    Task StopStudying();
}