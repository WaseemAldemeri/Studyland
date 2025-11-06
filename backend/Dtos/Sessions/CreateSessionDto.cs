namespace Dtos.Sessions;

public class CreateSessionDto
{
    public DateTimeOffset StartedAt { get; set; }
    public long DurationMs { get; set; }
    public Guid TopicId { get; set; }
}