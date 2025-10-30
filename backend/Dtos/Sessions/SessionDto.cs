using Dtos.Topics;
using Dtos.Users;

namespace Dtos.Sessions;

public class SessionDto
{
    public required string Id { get; set; }
    public required DateTimeOffset StartedAt { get; set; }
    public required TimeSpan DurationMS { get; set; }
    public required TopicDto Topic { get; set; }
    public required UserDto User { get; set; }
}
