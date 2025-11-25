using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using Dtos.Topics;

namespace Dtos.Users;


public class UserPressenceDto
{
    public required UserDto User { get; set; }
    [Required]
    public PressenceStatus Status { get; set; } = PressenceStatus.OFFLINE;
    public TopicDto? Topic { get; set; } = null;
    [Required]
    public DateTimeOffset StartedAt { get; set; } = DateTimeOffset.UtcNow;

    // if has value means we act as a countdown instead of acting as a stopwatch
    // for example, if status is studying and the timer duration is 25 minutes then this is a pomodoro session
    // also used for breaks to indicate when the break ends
    public int? TimerDurationMinutes { get; set; } = null;

    // Only used when Studying. Stores the break time for auto-transition.
    public int? NextBreakDurationMinutes { get; set; }
}

// this line makes the generated client generate strings instead of numbers enums
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum PressenceStatus
{
    STUDYING,
    ON_BREAK,
    ONLINE,
    OFFLINE
}

