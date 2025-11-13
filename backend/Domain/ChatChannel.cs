namespace Domain;

public class ChatChannel : IDomainEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required string Name { get; set; }

    public required Guid GuildId { get; set; }
    public Guid? Guild { get; set; }
    public ICollection<ChatMessage> Messages { get; set; } = [];
}