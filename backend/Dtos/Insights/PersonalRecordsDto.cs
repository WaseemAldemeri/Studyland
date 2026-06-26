using Dtos.Topics;

namespace Dtos.Insights;

public class PersonalRecordsDto
{
    public required int CurrentStreakDays { get; set; }
    public required int LongestStreakDays { get; set; }
    public required double TotalHours { get; set; }
    public required int TotalSessions { get; set; }
    public required int DaysStudied { get; set; }
    public required double AverageSessionMinutes { get; set; }

    public required double LongestSessionMinutes { get; set; }
    public DateOnly? LongestSessionDate { get; set; }
    public TopicDto? LongestSessionTopic { get; set; }

    public required double BestDayHours { get; set; }
    public DateOnly? BestDayDate { get; set; }

    public required double BestWeekHours { get; set; }
    public DateOnly? BestWeekStart { get; set; }

    public TopicDto? FavoriteTopic { get; set; }
    public required double FavoriteTopicHours { get; set; }

    public DateOnly? FirstSessionDate { get; set; }
}
