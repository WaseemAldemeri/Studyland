using API.Services.ChatPressence;
using API.SignalR;
using Microsoft.AspNetCore.SignalR;

namespace API.Jobs;

public class StudyTimerMonitor(PressenceService pressenceService, IHubContext<ChatHub> hubContext, ILogger<StudyTimerMonitor> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await MonitorTimers(stoppingToken);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "An error occurred while checking sessions' timers.");
            }

            await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
        }
    }

    private async Task MonitorTimers(CancellationToken stoppingToken)
    {
        var updates = await pressenceService.CheckAllExpiredTimers();

        if (updates.Count == 0) return;

        var tasks = updates.Select(update =>
            hubContext.Clients
                .Groups(update.ChannelId.ToString())
                .SendAsync(update.Event, update.UserPressence, stoppingToken)
        );

        await Task.WhenAll(tasks);
    }
}
