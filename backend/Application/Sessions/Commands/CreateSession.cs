using Persistence;
using Domain;
using MediatR;
using AutoMapper;
using Microsoft.EntityFrameworkCore;

namespace Application.Sessions.Commands;

public class CreateSession
{
    public record Command() : IRequest<string>
    {
        public required DateTimeOffset StartedAt { get; set; }
        public required TimeSpan DurationMS { get; set; }
        public required string UserId { get; set; }
        public required string TopicId { get; set; }
    }

    public class Handler(AppDbContext context, IMapper mapper) : IRequestHandler<Command, string>
    {
        public async Task<string> Handle(Command request, CancellationToken cancellationToken)
        {
            if (!await context.Topics.AnyAsync(t => t.Id == request.TopicId, cancellationToken))
            {
                throw new Exception("Topic Doesn't exist");
            }

            var session = mapper.Map<Session>(request);

            context.Sessions.Add(session);

            await context.SaveChangesAsync(cancellationToken);

            return session.Id;
        }
    }
}