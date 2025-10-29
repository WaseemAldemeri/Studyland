namespace Dtos.Users;

public class UserDto
{
    public required string Id { get; set; } 
    // public string? DiscordId { get; set; }
    public required string DisplayName { get; set; }
    public required DateTimeOffset DateJoined { get; set; }
}

