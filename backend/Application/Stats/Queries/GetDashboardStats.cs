using Application.Core;
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

    public class Handler(AppDbContext context, IMapper mapper) : IRequestHandler<Query, StatsDto>
    {
        public async Task<StatsDto> Handle(Query request, CancellationToken cancellationToken)
        {
            var sessions = await GetFilteredSessionsAsync(request);

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

        private async Task<List<Session>> GetFilteredSessionsAsync(Query request)
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

            return await queryable.ToListAsync();
        }

        private List<StatsDto.UserTopicBreakDown> GetTopicBreakDowns(IEnumerable<Session> sessions)
        {
            return sessions
                .GroupBy(s => new { s.User, s.Topic })
                .Select(g => new StatsDto.UserTopicBreakDown
                {
                    Topic = mapper.Map<TopicDto>(g.Key.Topic),
                    TotalStudyTimeHours = g.Sum(s => s.Duration.TotalHours),
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
                    AveregeSessionDurationMinutes = (long)g.Average(s => s.Duration.TotalMinutes),
                    TotalStudyTimeHours = (long)g.Sum(s => s.Duration.TotalHours),
                    User = mapper.Map<UserDto>(g.Key.User),
                    DaysStudied = g.DistinctBy(s => s.StartedAt.Date).Count(),
                })
                .ToList();
        }

        private List<StatsDto.DailyActivity> GetDailyActivitys(IEnumerable<Session> sessions)
        {

            return sessions
                .GroupBy(s => new { Date = DateOnly.FromDateTime(s.StartedAt.Date), s.User })
                .Select(g => new StatsDto.DailyActivity()
                {
                    Date = g.Key.Date,
                    User = mapper.Map<UserDto>(g.Key.User),
                    TotalHours = g.Sum(s => s.Duration.TotalHours)
                })
                .OrderBy(x => x.Date)
                .ToList();
        }
    }


    public class Validator : AbstractValidator<Query>
    {
        public Validator(AppDbContext context)
        {
            RuleFor(x => x.StartDate).Required();
            RuleFor(x => x.EndDate)
                .Required()
                .GreaterThan(x => x.StartDate)
                .WithMessage("End date must be after start date.");

            RuleFor(x => x.UserIds).Required();
            RuleForEach(x => x.UserIds).MustExistInDb(context.Users);

            When(x => x.TopicIds is not null && x.TopicIds.Count != 0, () =>
                RuleForEach(x => x.TopicIds).MustExistInDb(context.Topics)
            );
        }
        
        // before extension methods
        // 
        // RuleFor(x => x.StartDate).NotEmpty().WithMessage("startDate is required.");
        // RuleFor(x => x.EndDate)
        //     .NotEmpty().WithMessage("endDate is required.")
        //     .GreaterThan(x => x.StartDate)
        //     .WithMessage("End date must be after start date.");

        // RuleFor(x => x.UserIds).NotEmpty().WithMessage("userIds list is required");
        // RuleForEach(x => x.UserIds)
        //     .MustAsync(async (userId, cancellation) => 
        //        await context.Users.AnyAsync(u => u.Id == userId, cancellation)
        //     ).WithMessage((query, userId) => $"User with ID '{userId}' not found.");

        // When(x => x.TopicIds != null && x.TopicIds.Count != 0, () =>
        // {
        //     RuleForEach(x => x.TopicIds)
        //         .MustAsync(async (topicId, cancellation) =>
        //             await context.Topics.AnyAsync(t => t.Id == topicId, cancellation)
        //         )
        //         .WithMessage((query, topicId) => $"Topic with ID '{topicId}' not found.");
        // });
    }
}