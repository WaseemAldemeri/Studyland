using System.ComponentModel.DataAnnotations;

namespace Dtos.Topics;

public class CreateTopicDto
{
    [Required]
    public string Title { get; set; } = "";
}
