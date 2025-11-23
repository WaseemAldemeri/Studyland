using Application.Core;
using Application.Core.Extensions;
using AutoMapper;
using Dtos.Users;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Guilds.Queries;

public class GetGuildMembersGoals
{
    public class Query : IRequest<List<UserDailyGoalDto>>
    {
        public required Guid Id { get; set; }
    }

    public class Handler(AppDbContext context, IMapper mapper) : IRequestHandler<Query, List<UserDailyGoalDto>>
    {
        public async Task<List<UserDailyGoalDto>> Handle(Query request, CancellationToken cancellationToken)
        {
            if (!await context.Guilds.AnyAsync(g => g.Id == request.Id, cancellationToken))
                throw RestException.NotFound("The Requested guild doesn't exist");

            return (await context.Users
                .Where(u => u.GuildId == request.Id)
                .Select(u =>
                    new
                    {
                        User = u,
                        Sessions = u.Sessions
                            .Where(s => s.StartedAt >= DateTime.UtcNow.Date)
                            .Select(s => s.Duration)
                            .ToList()
                    }
                )
                .ToListAsync(cancellationToken))

                .Select(e => new UserDailyGoalDto()
                {
                    User = mapper.Map<UserDto>(e.User),
                    DailyGoalMs = (long)e.User.DailyGoal.TotalMilliseconds,
                    TotalStudiedMs = (long)e.Sessions.Sum(d => d.TotalMilliseconds)
                }).ToList();
        }
    }

    public class Validator : AbstractValidator<Query>
    {
        public Validator()
        {
            RuleFor(x => x.Id).Required();
        }
    }
}