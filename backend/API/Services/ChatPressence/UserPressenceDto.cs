using Dtos.Topics;
using Dtos.Users;

namespace API.Services.ChatPressence;


public class UserPressenceDto
{
    public required UserDto User { get; set; }
    public PressenceStatus Status { get; set; } = PressenceStatus.ONLINE;
    public TopicDto? Topic { get; set; }
    public DateTimeOffset StartedAt { get; set; } = DateTimeOffset.Now;
}

public enum PressenceStatus
{
    STUDYING,
    ON_BREAK,
    ONLINE
}
