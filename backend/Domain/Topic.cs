namespace Domain;

public class Topic : IDomainEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required string Title { get; set; }
    public List<Session> Sessions { get; set; } = [];
}