using Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;
using API.Features.Sessions;
using AutoMapper.QueryableExtensions;
using AutoMapper;

namespace Application.Sessions.Queries;

// this should filter based on current user and by optional filters like for a specific day
public class GetSessionsList
{
    public class Query : IRequest<List<SessionDto>>;

    public class Handler(AppDbContext context, IMapper mapper) : IRequestHandler<Query, List<SessionDto>>
    {
        public async Task<List<SessionDto>> Handle(Query request, CancellationToken cancellationToken)
        {
            return await context.Sessions.ProjectTo<SessionDto>(mapper.ConfigurationProvider).ToListAsync(cancellationToken);
        }
    }
}

