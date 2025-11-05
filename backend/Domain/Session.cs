namespace Domain;

public class Session
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public required DateTimeOffset StartedAt { get; set; }
    public required TimeSpan Duration { get; set; }

    public required Guid UserId { get; set; }
    public User? User { get; set; }

    public required Guid TopicId { get; set; }
    public Topic? Topic { get; set; }
}
