namespace Dtos.Sessions;


public class UpdateSessionDto
{
    public DateTimeOffset? StartedAt { get; set; }
    public long? DurationMs { get; set; }
    public string? TopicId { get; set; }
}