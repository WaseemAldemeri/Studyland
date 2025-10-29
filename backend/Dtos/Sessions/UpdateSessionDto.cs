namespace Dtos.Sessions;


public class UpdateSessionDto
{
    public DateTimeOffset? StartedAt { get; set; }
    public TimeSpan? DurationMS { get; set; }
    public string? TopicId { get; set; }
}