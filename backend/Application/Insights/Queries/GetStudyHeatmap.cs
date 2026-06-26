using Dtos.Insights;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Insights.Queries;

public class GetStudyHeatmap
{
    public class Query : IRequest<HeatmapDto>
    {
        public required Guid UserId { get; set; }
        public int Days { get; set; } = 365;
    }

    public class Handler(AppDbContext context) : IRequestHandler<Query, HeatmapDto>
    {
        public async Task<HeatmapDto> Handle(Query request, CancellationToken cancellationToken)
        {
            var days = Math.Clamp(request.Days, 1, 366);
            var today = DateOnly.FromDateTime(DateTimeOffset.UtcNow.Date);
            var startDate = today.AddDays(-(days - 1));
            var rangeStart = new DateTimeOffset(startDate.ToDateTime(TimeOnly.MinValue), TimeSpan.Zero);

            var sessions = await context.Sessions
                .Where(s => s.UserId == request.UserId && s.StartedAt >= rangeStart)
                .ToListAsync(cancellationToken);

            var dayBuckets = sessions
                .GroupBy(StudyMetrics.DateOf)
                .Select(g => new HeatmapDto.HeatmapDay
                {
                    Date = g.Key,
                    Hours = g.Sum(s => s.Duration.TotalHours),
                    Sessions = g.Count(),
                })
                .OrderBy(d => d.Date)
                .ToList();

            return new HeatmapDto
            {
                StartDate = startDate,
                EndDate = today,
                TotalHours = dayBuckets.Sum(d => d.Hours),
                ActiveDays = dayBuckets.Count,
                Days = dayBuckets,
            };
        }
    }
}
