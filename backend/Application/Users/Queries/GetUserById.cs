using Persistence;
using MediatR;
using Dtos.Users;
using AutoMapper;
using FluentValidation;
using Application.Core;

namespace Application.Users.Queries;

public class GetUserById
{
    public record Query(Guid Id) : IRequest<UserDto>;

    public class Handler(AppDbContext context, IMapper mapper) : IRequestHandler<Query, UserDto>
    {
        public async Task<UserDto> Handle(Query request, CancellationToken cancellationToken)
        {

            var user = await context.Users.FindAsync([request.Id], cancellationToken)
                ?? throw RestException.NotFound("No user with such id");

            return mapper.Map<UserDto>(user);
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