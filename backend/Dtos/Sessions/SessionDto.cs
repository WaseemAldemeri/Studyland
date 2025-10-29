using Dtos.Topics;

namespace API.Features.Sessions;

public class SessionDto
{
    public required string Id { get; set; }
    public required DateTimeOffset StartedAt { get; set; }
    public required TimeSpan DurationMS { get; set; }
    public required TopicDto Topic { get; set; }
}
