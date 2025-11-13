using Application.Core;
using Application.Core.Extensions;
using Application.Interfaces;
using Domain;
using Dtos.Accounts;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Application.Accounts.Commands;


public class Login
{
    public class Command : IRequest<LoginResponseDto>
    {
        public required string Email { get; set; }
        public required string Password { get; set; }
    };

    public class Handler(UserManager<User> userManager, ITokenService tokenService)
        : IRequestHandler<Command, LoginResponseDto>
    {
        public async Task<LoginResponseDto> Handle(Command request, CancellationToken cancellationToken)
        {
            var user = await userManager.FindByEmailAsync(request.Email);

            if (user is null || !await userManager.CheckPasswordAsync(user, request.Password))
            {
                throw RestException.BadRequest("Invalid Credentials");
            }

            var token = tokenService.CreateToken(user);

            // later on will add refresh token
            return new() { AccessToken = token };
        }
    }

    public class Validator : AbstractValidator<Command>
    {
        public Validator()
        {
            RuleFor(x => x.Email)
                .Required()
                .EmailAddress().WithMessage("Please provide a valid email address.");

            RuleFor(x => x.Password)
                .Required();
        }
    }
    
}

