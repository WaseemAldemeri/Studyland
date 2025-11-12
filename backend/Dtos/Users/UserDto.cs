namespace Dtos.Users;

public class UserDto
{
    public required Guid Id { get; set; } 
    public required string DisplayName { get; set; }
    public required DateTimeOffset DateJoined { get; set; }
    public required string Email { get; set; }
}

