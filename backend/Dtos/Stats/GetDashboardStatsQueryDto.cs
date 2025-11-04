namespace Dtos.Stats;

// This DTO represents the public-facing query parameters for the stats endpoint.
// the user ids are optoin in the params because we will add the current user id from the auth
public class GetDashboardStatsQueryDto
{
    public List<Guid>? UserIds { get; set; }
    public DateTimeOffset StartDate { get; set; }
    public DateTimeOffset EndDate { get; set; }
    public List<Guid>? TopicIds { get; set; }
}