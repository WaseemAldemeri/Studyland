using Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using Domain;
using FluentValidation;
using Application.Core;

namespace Application.Sessions.Commands;

public class UpdateSession
{
    public class Command() : IRequest
    {
        public required Guid Id { get; set; }
        public DateTimeOffset? StartedAt { get; set; }
        public TimeSpan? Duration { get; set; }
        public Guid? TopicId { get; set; }
    }


    public class Handler(AppDbContext context, IMapper mapper) : IRequestHandler<Command>
    {
        public async Task Handle(Command request, CancellationToken cancellationToken)
        {
            Session session = await context.Sessions.FindAsync([request.Id], cancellationToken)
                ?? throw RestException.NotFound("Can't find Session to update.");

            mapper.Map(request, session);

            await context.SaveChangesAsync(cancellationToken);
        }

    }


    public class Validator : AbstractValidator<Command>
    {
        public Validator(AppDbContext context)
        {
            RuleFor(x => x.Id).Required("id");

            When(x => x.TopicId is not null, () =>
                RuleFor(x => x.TopicId).MustExistsInDb<Command, Topic>(context, "Topic")
            );
        }
    }
}