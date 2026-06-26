using Domain;

namespace Application.Insights;

/// <summary>
/// Shared helpers for deriving study insights (streaks, day buckets) from raw sessions.
/// All "day" boundaries use the session's stored timestamp date to stay consistent with
/// the existing dashboard stats (which group on StartedAt.Date).
/// </summary>
public static class StudyMetrics
{
    public static DateOnly DateOf(Session session) => DateOnly.FromDateTime(session.StartedAt.Date);

    /// <summary>Monday-based start of the week for a given date.</summary>
    public static DateOnly WeekStart(DateOnly date) => date.AddDays(-(((int)date.DayOfWeek + 6) % 7));

    /// <summary>
    /// Consecutive days ending today (or yesterday, so a streak isn't "broken" until a full day passes).
    /// </summary>
    public static int CurrentStreak(IEnumerable<DateOnly> studyDates, DateOnly today)
    {
        var set = studyDates.ToHashSet();
        if (set.Count == 0) return 0;

        DateOnly? anchor = set.Contains(today) ? today
            : set.Contains(today.AddDays(-1)) ? today.AddDays(-1)
            : null;
        if (anchor is null) return 0;

        var streak = 0;
        var cursor = anchor.Value;
        while (set.Contains(cursor))
        {
            streak++;
            cursor = cursor.AddDays(-1);
        }
        return streak;
    }

    /// <summary>Longest run of consecutive study days across all history.</summary>
    public static int LongestStreak(IEnumerable<DateOnly> studyDates)
    {
        var ordered = studyDates.Distinct().OrderBy(d => d).ToList();
        if (ordered.Count == 0) return 0;

        int longest = 1, current = 1;
        for (var i = 1; i < ordered.Count; i++)
        {
            current = ordered[i] == ordered[i - 1].AddDays(1) ? current + 1 : 1;
            longest = Math.Max(longest, current);
        }
        return longest;
    }
}
