namespace Application.Awards;

/// <summary>
/// A milestone definition. <see cref="Category"/> selects which user metric the
/// <see cref="Threshold"/> is compared against; <see cref="Icon"/> is a lucide-react icon name
/// the frontend renders. <see cref="Key"/> is the stable id persisted on granted <c>Award</c> rows.
/// </summary>
public record MilestoneDef(
    string Key,
    string Title,
    string Description,
    string Category,
    string Icon,
    double Threshold);

/// <summary>Snapshot of a user's all-time metrics used to evaluate milestones.</summary>
public record MetricBag(
    int TotalSessions,
    double TotalHours,
    int LongestStreak,
    double LongestSessionMinutes,
    int DaysStudied);

public static class MilestoneCatalog
{
    public const string CatMilestone = "milestone";
    public const string CatTotalHours = "total_hours";
    public const string CatStreak = "streak";
    public const string CatSession = "session_minutes";
    public const string CatDays = "days_studied";
    public const string CatSessions = "sessions_count";

    public static readonly IReadOnlyList<MilestoneDef> All = new List<MilestoneDef>
    {
        new("first_session", "First Steps", "Complete your very first study session", CatMilestone, "Sparkles", 1),

        // Total hours — from a single hour all the way to legendary territory.
        new("hours_1", "Warming Up", "Study 1 hour in total", CatTotalHours, "Clock", 1),
        new("hours_10", "Committed", "Study 10 hours in total", CatTotalHours, "Clock", 10),
        new("hours_50", "Dedicated", "Study 50 hours in total", CatTotalHours, "Flame", 50),
        new("hours_100", "Centurion", "Study 100 hours in total", CatTotalHours, "Trophy", 100),
        new("hours_250", "Scholar", "Study 250 hours in total", CatTotalHours, "GraduationCap", 250),
        new("hours_500", "Devoted", "Study 500 hours in total", CatTotalHours, "Award", 500),
        new("hours_1000", "Grandmaster", "Study 1,000 hours in total", CatTotalHours, "Crown", 1000),
        new("hours_2500", "Sage", "Study 2,500 hours in total", CatTotalHours, "Crown", 2500),
        new("hours_5000", "Living Legend", "Study 5,000 hours in total", CatTotalHours, "Gem", 5000),
        new("hours_10000", "The 10,000 Hours", "Study 10,000 hours — true mastery", CatTotalHours, "Diamond", 10000),

        // Streaks.
        new("streak_3", "On a Roll", "Study 3 days in a row", CatStreak, "Flame", 3),
        new("streak_7", "Week Warrior", "Study 7 days in a row", CatStreak, "Flame", 7),
        new("streak_14", "Fortnight Focus", "Study 14 days in a row", CatStreak, "Flame", 14),
        new("streak_30", "Unstoppable", "Study 30 days in a row", CatStreak, "Flame", 30),
        new("streak_60", "Iron Will", "Study 60 days in a row", CatStreak, "Flame", 60),
        new("streak_100", "Centennial Streak", "Study 100 days in a row", CatStreak, "Flame", 100),
        new("streak_365", "Year of Discipline", "Study every day for a year", CatStreak, "Crown", 365),

        // Single-session length.
        new("session_60", "Deep Focus", "Study 1 hour in a single session", CatSession, "Target", 60),
        new("session_120", "In the Zone", "Study 2 hours in a single session", CatSession, "Target", 120),
        new("session_180", "Marathoner", "Study 3 hours in a single session", CatSession, "Target", 180),
        new("session_300", "Iron Focus", "Study 5 hours in a single session", CatSession, "Target", 300),
        new("session_480", "All-Dayer", "Study 8 hours in a single session", CatSession, "Target", 480),

        // Distinct days studied.
        new("days_7", "Regular", "Study on 7 different days", CatDays, "CalendarCheck", 7),
        new("days_30", "Habit Formed", "Study on 30 different days", CatDays, "CalendarCheck", 30),
        new("days_100", "A Way of Life", "Study on 100 different days", CatDays, "CalendarCheck", 100),
        new("days_365", "Round the Calendar", "Study on 365 different days", CatDays, "CalendarCheck", 365),
        new("days_730", "Two-Year Scholar", "Study on 730 different days", CatDays, "CalendarCheck", 730),

        // Session count.
        new("sessions_50", "Getting Going", "Log 50 study sessions", CatSessions, "ListChecks", 50),
        new("sessions_250", "Seasoned", "Log 250 study sessions", CatSessions, "ListChecks", 250),
        new("sessions_1000", "Thousand Sessions", "Log 1,000 study sessions", CatSessions, "ListChecks", 1000),
        new("sessions_5000", "Relentless", "Log 5,000 study sessions", CatSessions, "ListChecks", 5000),
    };

    public static double Metric(string category, MetricBag bag) => category switch
    {
        CatMilestone => bag.TotalSessions,
        CatTotalHours => bag.TotalHours,
        CatStreak => bag.LongestStreak,
        CatSession => bag.LongestSessionMinutes,
        CatDays => bag.DaysStudied,
        CatSessions => bag.TotalSessions,
        _ => 0,
    };
}
