namespace Models;

public class Session
{
    public string Id { get; set; } = Guid.NewGuid().ToString();

    public DateTimeOffset StartedAt { get; set; }
    public TimeSpan DurationMS { get; set; }

    public required string UserId { get; set; }
    public User? User { get; set; }

    public required string TopicId { get; set; }
    public Topic? Topic { get; set; }
}
