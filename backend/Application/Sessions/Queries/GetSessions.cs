using Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;
using AutoMapper.QueryableExtensions;
using AutoMapper;
using Dtos.Sessions;
using FluentValidation;

namespace Application.Sessions.Queries;

public class GetSessions
{
    public class Query : IRequest<List<SessionDto>>
    {
        public required DateOnly Date { get; set; }
        public required Guid UserId { get; set; }
    };

    public class Validator : AbstractValidator<Query>
    {
        public Validator(AppDbContext context)
        {
            RuleFor(x => x.UserId)
                .MustAsync(async (userId, canncellation) => await context.Users.AnyAsync(u => u.Id == userId));
        }
    }

    public class Handler(AppDbContext context, IMapper mapper, IValidator<Query> validator) : IRequestHandler<Query, List<SessionDto>>
    {
        public async Task<List<SessionDto>> Handle(Query request, CancellationToken cancellationToken)
        {

            await validator.ValidateAndThrowAsync(request);

            var startDate = request.Date.ToDateTime(TimeOnly.MinValue);
            var endDate = startDate.AddDays(1);

            return await context.Sessions
                .Where(s => s.UserId == request.UserId && s.StartedAt >= startDate && s.StartedAt < endDate)
                .OrderByDescending(s => s.StartedAt)
                .ProjectTo<SessionDto>(mapper.ConfigurationProvider)
                .ToListAsync(cancellationToken);
        }
    }
}

