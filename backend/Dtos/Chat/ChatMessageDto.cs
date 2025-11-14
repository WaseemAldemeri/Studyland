using Domain;
using Dtos.Users;

namespace Dtos.Chat;

public class ChatMessageDto
{
    public required Guid Id { get; set; }
    public required DateTimeOffset Timestamp { get; set; }
    public required string Content { get; set; }
    public required ChatMessageType MessageType { get; set; }
    public required UserDto User { get; set; }
}