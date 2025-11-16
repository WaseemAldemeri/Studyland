using Dtos.Topics;

namespace Dtos.Users;


public class UserPressenceDto
{
    public required UserDto User { get; set; }
    public PressenceStatus Status { get; set; } = PressenceStatus.OFFLINE;
    public TopicDto? Topic { get; set; } = null;
    public DateTimeOffset StartedAt { get; set; } = DateTimeOffset.Now;
}

public enum PressenceStatus
{
    STUDYING,
    ON_BREAK,
    ONLINE,
    OFFLINE
}

