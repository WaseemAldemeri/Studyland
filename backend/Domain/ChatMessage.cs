namespace Domain;

public class ChatMessage : IDomainEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTimeOffset Timestamp { get; set; } = DateTimeOffset.Now;
    public required string Content { get; set; }
    public ChatMessageType MessageType { get; set; } = ChatMessageType.USER;

    public required Guid ChannelId { get; set; }
    public ChatChannel? Channel { get; set; }
    public required Guid UserId { get; set; }
    public User? User { get; set; }
}

// system is for server messages and announcments
public enum ChatMessageType
{
    USER,
    SYSTEM
}