using Microsoft.AspNetCore.Identity;

namespace Domain;

public class User : IdentityUser<Guid>, IDomainEntity
{
    // a temp discord id just for migration purposes from discord
    public string? DiscordId { get; set; }
    public string DisplayName { get; set; } = "";
    public DateTimeOffset DateJoined { get; set; }

    public List<Session> Sessions { get; set; } = [];
    public List<Award> Awards { get; set; } = [];
}

