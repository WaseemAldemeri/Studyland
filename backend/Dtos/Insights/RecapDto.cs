using Dtos.Topics;

namespace Dtos.Insights;

public class RecapDto
{
    public required string Period { get; set; }
    public required DateOnly StartDate { get; set; }
    public required DateOnly EndDate { get; set; }

    public required double TotalHours { get; set; }
    public required int TotalSessions { get; set; }
    public required int DaysStudied { get; set; }
    public required double AverageSessionMinutes { get; set; }

    public required double PreviousPeriodHours { get; set; }
    public required double DeltaHours { get; set; }
    public required int CurrentStreakDays { get; set; }

    public DateOnly? BestDayDate { get; set; }
    public required double BestDayHours { get; set; }

    public required List<TopicSlice> TopTopics { get; set; }
    public required List<DailyHours> DailyBreakdown { get; set; }

    public class TopicSlice
    {
        public required TopicDto Topic { get; set; }
        public required double Hours { get; set; }
    }

    public class DailyHours
    {
        public required DateOnly Date { get; set; }
        public required double Hours { get; set; }
    }
}
