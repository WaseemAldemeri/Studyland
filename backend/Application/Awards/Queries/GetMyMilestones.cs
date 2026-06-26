using Application.Insights;
using Domain;
using Dtos.Awards;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Awards.Queries;

/// <summary>
/// Returns the full milestone catalog for the current user with earned/locked status and progress.
/// As a side effect it grants (persists an <c>Award</c> row for) any milestone that is now earned but
/// not yet recorded, so a user's historical achievements are backfilled the first time they open this.
/// </summary>
public class GetMyMilestones
{
    public class Query : IRequest<List<MilestoneDto>>
    {
        public required Guid UserId { get; set; }
    }

    public class Handler(AppDbContext context) : IRequestHandler<Query, List<MilestoneDto>>
    {
        public async Task<List<MilestoneDto>> Handle(Query request, CancellationToken cancellationToken)
        {
            var sessions = await context.Sessions
                .Where(s => s.UserId == request.UserId)
                .OrderBy(s => s.StartedAt)
                .ToListAsync(cancellationToken);

            var dates = sessions.Select(StudyMetrics.DateOf).Distinct().ToList();
            var bag = new MetricBag(
                TotalSessions: sessions.Count,
                TotalHours: sessions.Sum(s => s.Duration.TotalHours),
                LongestStreak: StudyMetrics.LongestStreak(dates),
                LongestSessionMinutes: sessions.Count == 0 ? 0 : sessions.Max(s => s.Duration.TotalMinutes),
                DaysStudied: dates.Count);

            var existingAwards = await context.Awards
                .Where(a => a.UserId == request.UserId)
                .ToListAsync(cancellationToken);

            var newlyGranted = 0;
            var result = new List<MilestoneDto>();

            foreach (var def in MilestoneCatalog.All)
            {
                var metric = MilestoneCatalog.Metric(def.Category, bag);
                var earned = metric >= def.Threshold;
                var existing = existingAwards.FirstOrDefault(a => a.Title == def.Key);
                DateOnly? earnedDate = existing is not null ? DateOnly.FromDateTime(existing.Date.Date) : null;

                if (earned && existing is null)
                {
                    var crossDate = EarnedDate(def, sessions, dates)
                        ?? DateOnly.FromDateTime(DateTimeOffset.UtcNow.Date);

                    context.Awards.Add(new Award
                    {
                        Title = def.Key,
                        Date = new DateTimeOffset(crossDate.ToDateTime(TimeOnly.MinValue), TimeSpan.Zero),
                        TotalDurationMS = TimeSpan.Zero,
                        UserId = request.UserId,
                    });
                    newlyGranted++;
                    earnedDate = crossDate;
                }

                result.Add(new MilestoneDto
                {
                    Key = def.Key,
                    Title = def.Title,
                    Description = def.Description,
                    Category = def.Category,
                    Icon = def.Icon,
                    Threshold = def.Threshold,
                    CurrentValue = metric,
                    Earned = earned,
                    EarnedDate = earned ? earnedDate : null,
                    ProgressPercent = def.Threshold <= 0 ? 0 : Math.Min(100, metric / def.Threshold * 100),
                });
            }

            if (newlyGranted > 0)
                await context.SaveChangesAsync(cancellationToken);

            return result
                .OrderByDescending(m => m.Earned)
                .ThenBy(m => m.Category)
                .ThenBy(m => m.Threshold)
                .ToList();
        }

        /// <summary>Best-effort reconstruction of the date a milestone's threshold was first crossed.</summary>
        private static DateOnly? EarnedDate(MilestoneDef def, List<Session> ordered, List<DateOnly> dates)
        {
            switch (def.Category)
            {
                case MilestoneCatalog.CatMilestone:
                    return ordered.Count > 0 ? StudyMetrics.DateOf(ordered[0]) : null;

                case MilestoneCatalog.CatSessions:
                {
                    var index = (int)def.Threshold - 1;
                    return index >= 0 && index < ordered.Count ? StudyMetrics.DateOf(ordered[index]) : null;
                }

                case MilestoneCatalog.CatTotalHours:
                {
                    var cumulative = 0d;
                    foreach (var s in ordered)
                    {
                        cumulative += s.Duration.TotalHours;
                        if (cumulative >= def.Threshold) return StudyMetrics.DateOf(s);
                    }
                    return null;
                }

                case MilestoneCatalog.CatSession:
                    return ordered
                        .Where(s => s.Duration.TotalMinutes >= def.Threshold)
                        .Select(s => (DateOnly?)StudyMetrics.DateOf(s))
                        .FirstOrDefault();

                case MilestoneCatalog.CatDays:
                {
                    var sorted = dates.OrderBy(d => d).ToList();
                    var index = (int)def.Threshold - 1;
                    return index >= 0 && index < sorted.Count ? sorted[index] : null;
                }

                case MilestoneCatalog.CatStreak:
                {
                    var sorted = dates.OrderBy(d => d).ToList();
                    var run = 0;
                    for (var i = 0; i < sorted.Count; i++)
                    {
                        run = i > 0 && sorted[i] == sorted[i - 1].AddDays(1) ? run + 1 : 1;
                        if (run >= def.Threshold) return sorted[i];
                    }
                    return null;
                }

                default:
                    return null;
            }
        }
    }
}
