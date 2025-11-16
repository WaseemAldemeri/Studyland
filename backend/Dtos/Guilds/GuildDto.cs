using Dtos.Chat;

namespace Dtos.Guilds;


public class GuildDto
{
    public required Guid Id { get; set; }
    public required string Name { get; set; }
    public required DateTimeOffset CreatedAt { get; set; }
    public required List<ChatChannelDto> Channels { get; set; }
}