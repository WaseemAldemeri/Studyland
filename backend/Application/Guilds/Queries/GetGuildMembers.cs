using Application.Core;
using Application.Core.Extensions;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Dtos.Users;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Guilds.Queries;

public class GetGuildMembers
{
    public class Query : IRequest<List<UserPressenceDto>>
    {
        public required Guid Id { get; set; }
    }
    
    public class Handler(AppDbContext context, IMapper mapper) : IRequestHandler<Query, List<UserPressenceDto>>
    {
        public async Task<List<UserPressenceDto>> Handle(Query request, CancellationToken cancellationToken)
        {
            if (!await context.Guilds.AnyAsync(g => g.Id == request.Id, cancellationToken))
                throw RestException.NotFound("The Requested guild doesn't exist");

            return await context.Users
                .Where(u => u.GuildId == request.Id)
                .ProjectTo<UserPressenceDto>(mapper.ConfigurationProvider)
                .ToListAsync(cancellationToken);
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