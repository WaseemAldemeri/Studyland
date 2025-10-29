namespace Domain;

public class User
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    // a temp discord id just for migration purposes from discord
    public string? DiscordId { get; set; }
    public required string DisplayName { get; set; }
    public required DateTimeOffset DateJoined { get; set; }

    public List<Session> Sessions { get; set; } = [];
    public List<Award> Awards { get; set; } = [];
}

