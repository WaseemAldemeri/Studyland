namespace Domain;

public class Session
{
    public string Id { get; set; } = Guid.NewGuid().ToString();

    public required DateTimeOffset StartedAt { get; set; }
    public required TimeSpan Duration { get; set; }

    public required string UserId { get; set; }
    public User? User { get; set; }

    public required string TopicId { get; set; }
    public Topic? Topic { get; set; }
}
