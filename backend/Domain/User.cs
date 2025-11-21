using Microsoft.AspNetCore.Identity;

namespace Domain;

public class User : IdentityUser<Guid>, IDomainEntity
{
    // a temp discord id just for migration purposes from discord
    public string? DiscordId { get; set; }
    public string DisplayName { get; set; } = "";
    public DateTimeOffset DateJoined { get; set; } = DateTimeOffset.UtcNow;
    public TimeSpan DailyGoal { get; set; } = TimeSpan.FromHours(3);

    public Guid? GuildId { get; set; }
    public Guild? Guild { get; set; }
    public ICollection<Session> Sessions { get; set; } = [];
    public ICollection<Award> Awards { get; set; } = [];
    public ICollection<ChatMessage> Messages { get; set; } = [];
}

