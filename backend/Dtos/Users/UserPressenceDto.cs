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

