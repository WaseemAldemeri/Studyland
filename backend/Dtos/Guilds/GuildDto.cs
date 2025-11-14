using Dtos.Chat;
using Dtos.Users;

namespace Dtos.Guilds;


public class GuildDto
{
    
    public required Guid Id { get; set; }
    public required string Name { get; set; }
    public required DateTimeOffset CreatedAt { get; set; }

    public ICollection<UserDto> Members { get; set; } = [];
    public required ICollection<ChatChannelDto> Channels { get; set; }
}