namespace Dtos.Sessions;

public class CreateSessionDto
{
    public required DateTimeOffset StartedAt { get; set; }
    public required long DurationMs { get; set; }
    public required string TopicId { get; set; }
}