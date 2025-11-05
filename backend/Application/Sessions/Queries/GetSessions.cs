using Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;
using AutoMapper.QueryableExtensions;
using AutoMapper;
using Dtos.Sessions;

namespace Application.Sessions.Queries;

public class GetSessions
{
    public class Query : IRequest<List<SessionDto>>
    {
        public required DateOnly Date { get; set; }
    };

    public class Handler(AppDbContext context, IMapper mapper) : IRequestHandler<Query, List<SessionDto>>
    {
        public async Task<List<SessionDto>> Handle(Query request, CancellationToken cancellationToken)
        {

            var startDate = request.Date.ToDateTime(TimeOnly.MinValue);
            var endDate = startDate.AddDays(1);

            return await context.Sessions
                .Where(s => s.StartedAt >= startDate && s.StartedAt < endDate)
                .OrderByDescending(s => s.StartedAt)
                .ProjectTo<SessionDto>(mapper.ConfigurationProvider)
                .ToListAsync(cancellationToken);
        }
    }
}

