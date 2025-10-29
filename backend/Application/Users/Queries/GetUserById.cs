using Persistence;
using MediatR;
using Domain;
using Dtos.Users;
using AutoMapper.QueryableExtensions;
using AutoMapper;

namespace Application.Users.Queries;

public class GetUserById
{
    public record Query(string Id) : IRequest<UserDto>;

    public class Handler(AppDbContext context, IMapper mapper) : IRequestHandler<Query, UserDto>
    {
        public async Task<UserDto> Handle(Query request, CancellationToken cancellationToken)
        {

            var user = await context.Users.FindAsync([request.Id], cancellationToken);

            if (user is null)
            {
                throw new Exception("No user with such id");
            }

            return mapper.Map<UserDto>(user);
        }
    }
}