using API.Services.ChatPressence;
using API.SignalR;
using Microsoft.AspNetCore.SignalR;

namespace API.Jobs;

public class ZombieSessionsKiller(PressenceService pressenceService, IHubContext<ChatHub> hubContext, ILogger<ZombieSessionsKiller> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await KillZombiChannels(stoppingToken);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "An error occurred while killing zombie sessions.");
            }

            await Task.Delay(TimeSpan.FromMinutes(30), stoppingToken);
        }
    }

    private async Task KillZombiChannels(CancellationToken stoppingToken)
    {
        var channelsToUpdate = await pressenceService.KillAllZombiSessions(TimeSpan.FromHours(2.5));

        foreach (var channel in channelsToUpdate)
        {
            _ = hubContext.Clients
                .Groups(channel.Id.ToString())
                .SendAsync(ChatHubEvents.RecievePressenceList, channel.Users, stoppingToken);
        }
    }
}