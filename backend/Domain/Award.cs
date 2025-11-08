namespace Domain;

public class Award : IDomainEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required string Title { get; set; }    
    public required DateTimeOffset Date { get; set; }
    public required TimeSpan TotalDurationMS { get; set; }

    public required Guid UserId { get; set; }
    public User? User { get; set; }
}