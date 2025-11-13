namespace Domain;

public class Guild : IDomainEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required string Name { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.Now;

    public ICollection<User> Members { get; set; } = [];
    public ICollection<ChatChannel> Channels { get; set; } = [];
}