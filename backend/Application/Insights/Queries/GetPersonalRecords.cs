using AutoMapper;
using Domain;
using Dtos.Insights;
using Dtos.Topics;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Insights.Queries;

public class GetPersonalRecords
{
    public class Query : IRequest<PersonalRecordsDto>
    {
        public required Guid UserId { get; set; }
    }

    public class Handler(AppDbContext context, IMapper mapper) : IRequestHandler<Query, PersonalRecordsDto>
    {
        public async Task<PersonalRecordsDto> Handle(Query request, CancellationToken cancellationToken)
        {
            var sessions = await context.Sessions
                .Where(s => s.UserId == request.UserId)
                .Include(s => s.Topic)
                .ToListAsync(cancellationToken);

            if (sessions.Count == 0)
            {
                return new PersonalRecordsDto
                {
                    CurrentStreakDays = 0,
                    LongestStreakDays = 0,
                    TotalHours = 0,
                    TotalSessions = 0,
                    DaysStudied = 0,
                    AverageSessionMinutes = 0,
                    LongestSessionMinutes = 0,
                    BestDayHours = 0,
                    BestWeekHours = 0,
                    FavoriteTopicHours = 0,
                };
            }

            var dates = sessions.Select(StudyMetrics.DateOf).Distinct().ToList();
            var today = DateOnly.FromDateTime(DateTimeOffset.UtcNow.Date);

            var longestSession = sessions.MaxBy(s => s.Duration)!;

            var bestDay = sessions
                .GroupBy(StudyMetrics.DateOf)
                .Select(g => new { Date = g.Key, Hours = g.Sum(s => s.Duration.TotalHours) })
                .MaxBy(x => x.Hours)!;

            var bestWeek = sessions
                .GroupBy(s => StudyMetrics.WeekStart(StudyMetrics.DateOf(s)))
                .Select(g => new { Start = g.Key, Hours = g.Sum(s => s.Duration.TotalHours) })
                .MaxBy(x => x.Hours)!;

            var favoriteTopic = sessions
                .GroupBy(s => s.Topic)
                .Select(g => new { Topic = g.Key, Hours = g.Sum(s => s.Duration.TotalHours) })
                .MaxBy(x => x.Hours)!;

            return new PersonalRecordsDto
            {
                CurrentStreakDays = StudyMetrics.CurrentStreak(dates, today),
                LongestStreakDays = StudyMetrics.LongestStreak(dates),
                TotalHours = sessions.Sum(s => s.Duration.TotalHours),
                TotalSessions = sessions.Count,
                DaysStudied = dates.Count,
                AverageSessionMinutes = sessions.Average(s => s.Duration.TotalMinutes),

                LongestSessionMinutes = longestSession.Duration.TotalMinutes,
                LongestSessionDate = StudyMetrics.DateOf(longestSession),
                LongestSessionTopic = mapper.Map<TopicDto>(longestSession.Topic),

                BestDayHours = bestDay.Hours,
                BestDayDate = bestDay.Date,

                BestWeekHours = bestWeek.Hours,
                BestWeekStart = bestWeek.Start,

                FavoriteTopic = mapper.Map<TopicDto>(favoriteTopic.Topic),
                FavoriteTopicHours = favoriteTopic.Hours,

                FirstSessionDate = dates.Min(),
            };
        }
    }
}
