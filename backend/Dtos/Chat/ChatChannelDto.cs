namespace Dtos.Chat;

public class ChatChannelDto
{
    public required Guid Id { get; set; }
    public required string Name { get; set; }
    // public ICollection<ChatMessageDto> Messages { get; set; } = [];
}