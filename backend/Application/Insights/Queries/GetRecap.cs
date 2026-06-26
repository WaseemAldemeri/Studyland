using AutoMapper;
using Domain;
using Dtos.Insights;
using Dtos.Topics;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Insights.Queries;

public class GetRecap
{
    public class Query : IRequest<RecapDto>
    {
        public required Guid UserId { get; set; }
        public string Period { get; set; } = "week";
    }

    public class Handler(AppDbContext context, IMapper mapper) : IRequestHandler<Query, RecapDto>
    {
        public async Task<RecapDto> Handle(Query request, CancellationToken cancellationToken)
        {
            var period = string.Equals(request.Period, "month", StringComparison.OrdinalIgnoreCase) ? "month" : "week";
            var today = DateOnly.FromDateTime(DateTimeOffset.UtcNow.Date);

            DateOnly start, end, prevStart;
            if (period == "month")
            {
                start = new DateOnly(today.Year, today.Month, 1);
                end = start.AddMonths(1);
                prevStart = start.AddMonths(-1);
            }
            else
            {
                start = StudyMetrics.WeekStart(today);
                end = start.AddDays(7);
                prevStart = start.AddDays(-7);
            }

            var rangeStart = new DateTimeOffset(prevStart.ToDateTime(TimeOnly.MinValue), TimeSpan.Zero);
            var rangeEnd = new DateTimeOffset(end.ToDateTime(TimeOnly.MinValue), TimeSpan.Zero);

            var sessions = await context.Sessions
                .Where(s => s.UserId == request.UserId && s.StartedAt >= rangeStart && s.StartedAt < rangeEnd)
                .Include(s => s.Topic)
                .ToListAsync(cancellationToken);

            var current = sessions.Where(s => StudyMetrics.DateOf(s) >= start && StudyMetrics.DateOf(s) < end).ToList();
            var previousHours = sessions
                .Where(s => StudyMetrics.DateOf(s) >= prevStart && StudyMetrics.DateOf(s) < start)
                .Sum(s => s.Duration.TotalHours);

            var totalHours = current.Sum(s => s.Duration.TotalHours);

            var topTopics = current
                .GroupBy(s => s.Topic)
                .Select(g => new RecapDto.TopicSlice
                {
                    Topic = mapper.Map<TopicDto>(g.Key),
                    Hours = g.Sum(s => s.Duration.TotalHours),
                })
                .OrderByDescending(t => t.Hours)
                .Take(3)
                .ToList();

            var bestDay = current
                .GroupBy(StudyMetrics.DateOf)
                .Select(g => new { Date = g.Key, Hours = g.Sum(s => s.Duration.TotalHours) })
                .MaxBy(x => x.Hours);

            var dailyBreakdown = new List<RecapDto.DailyHours>();
            for (var d = start; d < end; d = d.AddDays(1))
            {
                var hours = current.Where(s => StudyMetrics.DateOf(s) == d).Sum(s => s.Duration.TotalHours);
                dailyBreakdown.Add(new RecapDto.DailyHours { Date = d, Hours = hours });
            }

            // Streak can extend before the recap window, so derive it from a wider date set.
            var streakWindowStart = new DateTimeOffset(today.AddDays(-400).ToDateTime(TimeOnly.MinValue), TimeSpan.Zero);
            var streakDates = await context.Sessions
                .Where(s => s.UserId == request.UserId && s.StartedAt >= streakWindowStart)
                .Select(s => s.StartedAt)
                .ToListAsync(cancellationToken);
            var distinctStreakDates = streakDates.Select(s => DateOnly.FromDateTime(s.Date)).Distinct().ToList();

            return new RecapDto
            {
                Period = period,
                StartDate = start,
                EndDate = end.AddDays(-1),
                TotalHours = totalHours,
                TotalSessions = current.Count,
                DaysStudied = current.Select(StudyMetrics.DateOf).Distinct().Count(),
                AverageSessionMinutes = current.Count == 0 ? 0 : current.Average(s => s.Duration.TotalMinutes),
                PreviousPeriodHours = previousHours,
                DeltaHours = totalHours - previousHours,
                CurrentStreakDays = StudyMetrics.CurrentStreak(distinctStreakDates, today),
                BestDayDate = bestDay?.Date,
                BestDayHours = bestDay?.Hours ?? 0,
                TopTopics = topTopics,
                DailyBreakdown = dailyBreakdown,
            };
        }
    }
}
