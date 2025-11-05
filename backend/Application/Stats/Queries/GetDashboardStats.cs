using AutoMapper;
using Domain;
using Dtos.Stats;
using Dtos.Topics;
using Dtos.Users;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Stats.Queries;

public class GetDashboardStats
{
    public class Query : IRequest<StatsDto>
    {
        public required List<Guid> UserIds { get; set; }
        public DateTimeOffset StartDate { get; set; }
        public DateTimeOffset EndDate { get; set; }
        public List<Guid>? TopicIds { get; set; }
    }

    public class Validator : AbstractValidator<Query>
    {
        public Validator(AppDbContext context) // We can inject the DbContext here!
        {
            // Rule: StartDate must be before EndDate
            RuleFor(x => x.EndDate).GreaterThan(x => x.StartDate)
                .WithMessage("End date must be after start date.");

            // Rule: All provided UserIds must exist in the database.
            RuleForEach(x => x.UserIds).MustAsync(async (userId, cancellation) =>
            {
                return await context.Users.AnyAsync(u => u.Id == userId, cancellation);
            }).WithMessage((query, userId) => $"User with ID '{userId}' not found.");

            // Rule: All provided TopicIds (if any) must exist.
            When(x => x.TopicIds != null && x.TopicIds.Count != 0, () =>
            {
                RuleForEach(x => x.TopicIds).MustAsync(async (topicId, cancellation) =>
                {
                    return await context.Topics.AnyAsync(t => t.Id == topicId, cancellation);
                }).WithMessage((query, topicId) => $"Topic with ID '{topicId}' not found.");
            });
        }
    }

    public class Handler(AppDbContext context, IValidator<Query> validator, IMapper mapper) : IRequestHandler<Query, StatsDto>
    {
        public async Task<StatsDto> Handle(Query request, CancellationToken cancellationToken)
        {
            await validator.ValidateAndThrowAsync(request, cancellationToken);

            IQueryable<Session> queryable = GetFilterQuery(request);
            var sessions = await queryable.ToListAsync(cancellationToken);

            var kpis = GetKpis(sessions);
            var topicBreakDowns = GetTopicBreakDowns(sessions);
            var dailyActivities = GetDailyActivitys(sessions);

            return new StatsDto()
            {
                DailyActivities = dailyActivities,
                UsersKpis = kpis,
                UsersTopicBreakDowns = topicBreakDowns,
                StartDate = DateOnly.FromDateTime(request.StartDate.Date),
                EndDate = DateOnly.FromDateTime(request.EndDate.Date),
                TotalDays = (int)(request.EndDate - request.StartDate).TotalDays
            };
        }

        private IQueryable<Session> GetFilterQuery(Query request)
        {
            var queryable = context.Sessions.Where(
                x => request.UserIds.Contains(x.UserId) &&
                x.StartedAt >= request.StartDate &&
                x.StartedAt < request.EndDate
            );

            if (request.TopicIds is not null && request.TopicIds.Count != 0)
            {
                queryable = queryable.Where(x => request.TopicIds.Contains(x.TopicId));
            }

            queryable = queryable
                .Include(s => s.Topic)
                .Include(s => s.User);

            return queryable;
        }

        private List<StatsDto.UserTopicBreakDown> GetTopicBreakDowns(IEnumerable<Session> sessions)
        {
            return sessions
                .GroupBy(s => new { s.User, s.Topic })
                .Select(g => new StatsDto.UserTopicBreakDown
                {
                    Topic = mapper.Map<TopicDto>(g.Key.Topic),
                    TotalStudyTime = TimeSpan.FromTicks(g.Sum(s => s.Duration.Ticks)),
                    User = mapper.Map<UserDto>(g.Key.User)

                })
                .ToList();
        }

        private List<StatsDto.UserKpiStats> GetKpis(IEnumerable<Session> sessions)
        {

            return sessions
                .GroupBy(s => new { s.User })
                .Select(g => new StatsDto.UserKpiStats
                {
                    AveregeSessionDuration = TimeSpan.FromTicks((long)g.Average(s => s.Duration.Ticks)),
                    TotalStudyTime = TimeSpan.FromTicks(g.Sum(s => s.Duration.Ticks)),
                    User = mapper.Map<UserDto>(g.Key.User),
                    DaysStudied = g.DistinctBy(s => s.StartedAt.Date).Count(),
                })
                .ToList();
        }

        private List<StatsDto.DailyActivity> GetDailyActivitys(IEnumerable<Session> sessions)
        {

            return sessions
                .GroupBy(s => new { s.StartedAt.Date, s.User })
                .Select(g => new StatsDto.DailyActivity()
                {
                    Date = DateOnly.FromDateTime(g.Key.Date),
                    User = mapper.Map<UserDto>(g.Key.User),
                    TotalDuration = TimeSpan.FromTicks(g.Sum(s => s.Duration.Ticks))
                })
                .OrderBy(x => x.Date)
                .ToList();
        }
    }


}