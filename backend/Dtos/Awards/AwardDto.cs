using Dtos.Users;

namespace Dtos.Awards;


public class AwardDto
{
    public required string Id { get; set; }
    public required string Title { get; set; }
    public required DateTimeOffset Date { get; set; }
    public required TimeSpan TotalDurationMS { get; set; }

    public required UserDto User { get; set; }

}