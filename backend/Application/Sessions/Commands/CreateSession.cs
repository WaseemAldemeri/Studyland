using Persistence;
using Domain;
using MediatR;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using FluentValidation;
using Application.Core;

namespace Application.Sessions.Commands;

public class CreateSession
{
    public record Command() : IRequest<Guid>
    {
        public required DateTimeOffset StartedAt { get; set; }
        public required TimeSpan Duration { get; set; }
        public required Guid UserId { get; set; }
        public required Guid TopicId { get; set; }
    }
    

    public class Handler(AppDbContext context, IMapper mapper) : IRequestHandler<Command, Guid>
    {
        public async Task<Guid> Handle(Command request, CancellationToken cancellationToken)
        {
            var session = mapper.Map<Session>(request);

            context.Sessions.Add(session);

            await context.SaveChangesAsync(cancellationToken);

            return session.Id;
        }
    }

    public class Validator : AbstractValidator<Command>
    {
        public Validator(AppDbContext context)
        {
            RuleFor(x => x.StartedAt).Required();
            RuleFor(x => x.Duration).Required();

            RuleFor(x => x.UserId)
                .Required()
                .MustExistInDb(context.Users);

            RuleFor(x => x.TopicId)
                .Required()
                .MustExistInDb(context.Topics);
        }

        // before using my custoum extensions for fluent validation
        //
        // RuleFor(x => x.StartedAt).NotEmpty().WithMessage("startedAt is required.");
        // RuleFor(x => x.DurationMS).NotEmpty().WithMessage("durationMs is required.");

        // RuleFor(x => x.UserId)
        //     .NotEmpty() .WithMessage("userId is required.")
        //     .MustAsync(async (userId, cancellation) =>
        //         await context.Users.AnyAsync(u => u.Id == userId, cancellation)
        //     )
        //     .WithMessage((command, userId) => $"User with ID {userId} not found.");

        // RuleFor(x => x.TopicId)
        //     .NotEmpty().WithMessage("topicId is required.")
        //     .MustAsync(async (topicId, cancellation) =>
        //         await context.Topics.AnyAsync(t => t.Id == topicId, cancellation)
        //     )
        //     .WithMessage((command, topicId) => $"Topic with ID {topicId} not found.");
    }
}