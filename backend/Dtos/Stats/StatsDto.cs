using Dtos.Topics;
using Dtos.Users;

namespace Dtos.Stats;

public class StatsDto
{
    public required List<DailyActivity> DailyActivities { get; set; }
    public required KpiStats Kpis { get; set; }
    public required List<TopicBreakDown> TopicBreakDowns { get; set; }

    public class DailyActivity
    {
        public required DateOnly Date { get; set; }
        public required TimeSpan TotalDuration { get; set; }
        public required UserDto User { get; set; }
    }

    public class KpiStats
    {
        public required TimeSpan TotalStudyTime { get; set; }
        public required TimeSpan AveregeSessionDuration { get; set; }
        public required int DaysStudied { get; set; }
        public required int TotalDays { get; set; }
    }

    public class TopicBreakDown
    {
        public required TopicDto Topic { get; set; }
        public required TimeSpan TotalStudyTime { get; set; }
    }
    
}


