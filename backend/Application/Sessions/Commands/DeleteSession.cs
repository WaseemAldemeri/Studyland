using Persistence;
using MediatR;
using FluentValidation;
using Application.Core;
using Application.Core.Extensions;

namespace Application.Sessions.Commands;

public class DeleteSession
{
    public record Command(Guid Id) : IRequest;
    

    public class Handler(AppDbContext context) : IRequestHandler<Command>
    {
        public async Task Handle(Command request, CancellationToken cancellationToken)
        {
            var session = await context.Sessions.FindAsync([request.Id], cancellationToken)
                ?? throw RestException.NotFound($"Coudln't Find Session with ID ${request.Id} to Delete.");

            context.Sessions.Remove(session);

            await context.SaveChangesAsync(cancellationToken);
        }
    }


    public class Validator : AbstractValidator<Command>
    {
        public Validator()
        {
            RuleFor(x => x.Id).Required();
        }
    }
}
