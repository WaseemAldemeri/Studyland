using Dtos.Topics;
using Dtos.Users;

namespace Dtos.Sessions;

public class SessionDto
{
    public required Guid Id { get; set; }
    public required DateTimeOffset StartedAt { get; set; }
    public required long DurationMs { get; set; }
    public required TimeSpan Duration { get; set; }
    public required TopicDto Topic { get; set; }
    public required UserDto User { get; set; }
}
