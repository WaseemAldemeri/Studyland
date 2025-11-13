namespace Domain;

public class Topic : IDomainEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required string Title { get; set; }

    public ICollection<Session> Sessions { get; set; } = [];
}