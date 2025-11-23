using Application.Core;
using Application.Core.Extensions;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Users.Commands;

public class UpdateDailyGoal
{
    public class Command : IRequest
    {
        public required Guid UserId {get;set;}
        public required TimeSpan DailyGoal {get;set;}
    }
    
    public class Handler(AppDbContext context) : IRequestHandler<Command>
    {
        public async Task Handle(Command request, CancellationToken cancellationToken)
        {
            var user = await context.Users.FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken)
                ?? throw RestException.NotFound("Requested user doesn't exist");
            
            user.DailyGoal = request.DailyGoal;
            
            await context.SaveChangesAsync(cancellationToken);
        }
    }
    
    public class Validator : AbstractValidator<Command>
    {
        public Validator()
        {
            RuleFor(x => x.UserId)
                .Required();
            
            RuleFor(x => x.DailyGoal)
                .Required()
                .ExclusiveBetween(TimeSpan.Zero, TimeSpan.FromHours(24))
                .WithMessage("Daily Goal Should be between 0 and 24 hours");
        }
    }
}