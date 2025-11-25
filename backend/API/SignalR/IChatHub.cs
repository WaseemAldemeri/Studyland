namespace API.SignalR;

public interface IChatHub
{
    Task JoinChannel(Guid channelId);
    Task SendMessage(string messageContent);
    Task StartStudying(Guid topicId, int? pomodoroDurationMinutes = null, int? nextBreakDurationMinutes = null);
    Task StopStudying();
    Task StartBreak(int durationMinutes);
    Task StopBreak();
    Task GetPressenceList();
}