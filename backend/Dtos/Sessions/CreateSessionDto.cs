using System.ComponentModel.DataAnnotations;

namespace Dtos.Sessions;

public class CreateSessionDto
{
    [Required]
    public DateTimeOffset StartedAt { get; set; }
    [Required]
    public long DurationMs { get; set; }
    [Required]
    public Guid TopicId { get; set; }
}