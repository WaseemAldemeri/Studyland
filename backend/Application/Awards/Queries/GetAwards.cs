using AutoMapper;
using AutoMapper.QueryableExtensions;
using Dtos.Awards;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Awards.Queries;

public class GetAwards
{
    public class Query : IRequest<List<AwardDto>>
    {

    }

    public class Handler(AppDbContext context, IMapper mapper) : IRequestHandler<Query, List<AwardDto>>
    {
        public async Task<List<AwardDto>> Handle(Query request, CancellationToken cancellationToken)
        {
            return await context.Awards.ProjectTo<AwardDto>(mapper.ConfigurationProvider).ToListAsync();
        }
    }
}