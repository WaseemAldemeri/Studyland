using Application.Core;
using Application.Core.Extensions;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Dtos.Guilds;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Guilds.Queries;

public class GetGuidDetails
{
    public class Query : IRequest<GuildDto>
    {
        public required Guid Id { get; set; }
    }

    public class Handler(AppDbContext context, IMapper mapper) : IRequestHandler<Query, GuildDto>
    {
        public async Task<GuildDto> Handle(Query request, CancellationToken cancellationToken)
        {
            return await context.Guilds
                .ProjectTo<GuildDto>(mapper.ConfigurationProvider)
                .FirstOrDefaultAsync(g => g.Id == request.Id, cancellationToken)
                ?? throw RestException.NotFound("The Requested guild doesn't exist");
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