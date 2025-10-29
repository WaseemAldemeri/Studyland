using Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Dtos.Users;
using AutoMapper.QueryableExtensions;
using AutoMapper;

namespace Application.Users.Queries;

public class GetUsersList()
{
    public class Query : IRequest<List<UserDto>>;

    public class Handler(AppDbContext context, IMapper mapper) : IRequestHandler<Query, List<UserDto>>
    {
        public async Task<List<UserDto>> Handle(Query request, CancellationToken cancellationToken)
        {
            return await context.Users.ProjectTo<UserDto>(mapper.ConfigurationProvider).ToListAsync(cancellationToken);
        }
    }
}