using Dtos.Topics;
using Dtos.Users;

namespace Dtos.Stats;

public class StatsDto
{
    public required List<DailyActivity> DailyActivities { get; set; }
    public required List<UserKpiStats> UsersKpis { get; set; }
    public required List<UserTopicBreakDown> UsersTopicBreakDowns { get; set; }
    public required DateOnly StartDate { get; set; }
    public required DateOnly EndDate { get; set; }
    public required int TotalDays { get; set; }

    public class DailyActivity
    {
        public required DateOnly Date { get; set; }
        public required TimeSpan TotalDuration { get; set; }
        public required UserDto User { get; set; }
    }

    public class UserKpiStats
    {
        public required TimeSpan TotalStudyTime { get; set; }
        public required TimeSpan AveregeSessionDuration { get; set; }
        public required int DaysStudied { get; set; }
        public required UserDto User { get; set; }
    }

    public class UserTopicBreakDown
    {
        public required TopicDto Topic { get; set; }
        public required TimeSpan TotalStudyTime { get; set; }
        public required UserDto User { get; set; }
    }
}


