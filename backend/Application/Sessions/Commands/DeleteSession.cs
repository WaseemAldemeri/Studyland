using Persistence;
using MediatR;
using FluentValidation;

namespace Application.Sessions.Commands;

public class DeleteSession
{
    public record Command(Guid Id) : IRequest;
    

    public class Handler(AppDbContext context) : IRequestHandler<Command>
    {
        public async Task Handle(Command request, CancellationToken cancellationToken)
        {
            var session = await context.Sessions.FindAsync([request.Id], cancellationToken)
                ?? throw new Exception($"Coudln't Find Session with ID ${request.Id} to Delete.");

            context.Sessions.Remove(session);

            await context.SaveChangesAsync(cancellationToken);
        }
    }


    public class Validator : AbstractValidator<Command>
    {
        public Validator()
        {
            RuleFor(x => x.Id).NotEmpty().WithMessage("id is required.");
        }
    }
}
