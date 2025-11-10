using Application.Core;
using AutoMapper;
using Domain;
using Dtos.Accounts;
using FluentValidation;
using FluentValidation.Results;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Accounts.Commands;

public class Register
{
    public class Command : IRequest
    {
        public required string DisplayName { get; set; }
        public required string Email { get; set; }
        public required string Password { get; set; }
    };

    public class Handler(AppDbContext context, UserManager<User> userManager, IMapper mapper)
        : IRequestHandler<Command>
    {
        public async Task Handle(Command request, CancellationToken cancellationToken)
        {
            if (await context.Users.AnyAsync(u => u.DisplayName == request.DisplayName, cancellationToken))
            {
                throw new ValidationException("Username already taken");
            }

            var user = mapper.Map<User>(request);

            var result = await userManager.CreateAsync(user, request.Password);

            if (!result.Succeeded)
            {
                var validationException = new ValidationException(
                    result.Errors.Select(e => new ValidationFailure(e.Code, e.Description))
                );

                throw validationException;
            }
        }
    }

    public class Validator : AbstractValidator<Command>
    {
        public Validator()
        {
            RuleFor(x => x.DisplayName)
                .Required();

            // identity should handle no duplicate emails
            RuleFor(x => x.Email)
                .Required()
                .EmailAddress().WithMessage("Please provide a valid email address.");

            // identity will handle other password requirements
            RuleFor(x => x.Password)
                .Required();
        }
    }
    
}


