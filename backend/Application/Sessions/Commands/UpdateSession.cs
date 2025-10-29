using Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using Domain;

namespace Application.Sessions.Commands;

public class UpdateSession
{
    public class Command() : IRequest
    {
        public required string Id { get; set; }
        public DateTimeOffset? StartedAt { get; set; }
        public TimeSpan? DurationMS { get; set; }
        public string? TopicId { get; set; }
    }

    public class Handler(AppDbContext context, IMapper mapper) : IRequestHandler<Command>
    {
        public async Task Handle(Command request, CancellationToken cancellationToken)
        {
            Session session = await context.Sessions.FindAsync([request.Id], cancellationToken)
                ?? throw new Exception("Can't find Session to update.");


            if (session.TopicId is not null && !await context.Topics.AnyAsync(t => t.Id == request.TopicId))
            {
                throw new Exception("Can't Find Topic to assign to session.");
            }

            mapper.Map(request, session);

            await context.SaveChangesAsync(cancellationToken);
        }
    }
}