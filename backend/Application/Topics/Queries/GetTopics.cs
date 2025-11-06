using AutoMapper;
using AutoMapper.QueryableExtensions;
using Dtos.Topics;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Topics.Queries;

public class GetTopics
{
    public class Query : IRequest<List<TopicDto>>;

    public class Handler(AppDbContext context, IMapper mapper) : IRequestHandler<Query, List<TopicDto>>
    {
        public async Task<List<TopicDto>> Handle(Query request, CancellationToken cancellationToken)
        {
            return await context.Topics.ProjectTo<TopicDto>(mapper.ConfigurationProvider).ToListAsync();
        }
    }
}
