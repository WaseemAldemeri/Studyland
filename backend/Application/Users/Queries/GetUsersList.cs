using Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Dtos.Users;
using AutoMapper.QueryableExtensions;
using AutoMapper;
using Domain;

namespace Application.Users.Queries;

public class GetUsersList()
{
    public class Query : IRequest<List<User>>;

    public class Handler(AppDbContext context, IMapper mapper) : IRequestHandler<Query, List<User>>
    {
        public async Task<List<User>> Handle(Query request, CancellationToken cancellationToken)
        {
            return await context.Users.ToListAsync(cancellationToken);
        }
    }
}