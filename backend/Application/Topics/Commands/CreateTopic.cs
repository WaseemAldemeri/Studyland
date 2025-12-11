using Application.Core;
using Application.Core.Extensions;
using AutoMapper;
using Domain;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Topics.Commands;

public class CreateTopic
{
    public class Command : IRequest<Guid>
    {
        public required string Title { get; set; }
    }
    
    public class Handler(AppDbContext context, IMapper mapper) : IRequestHandler<Command, Guid>
    {
        public async Task<Guid> Handle(Command request, CancellationToken cancellationToken)
        {
            if (await context.Topics.AnyAsync(t => t.Title == request.Title, cancellationToken))
            {
                throw RestException.BadRequest("A topic with this title already exists");
            }
            
            var newTopic = mapper.Map<Topic>(request);
            await context.Topics.AddAsync(newTopic, cancellationToken);

            await context.SaveChangesAsync(cancellationToken);
            
            return newTopic.Id;
        }
    }
    
    public class Validator : AbstractValidator<Command>
    {
        public Validator()
        {
            RuleFor(x => x.Title).Required();
        }
    }
}