using MediatR;
using Microsoft.AspNetCore.Mvc;
using Dtos.Accounts;
using AutoMapper;
using Application.Accounts.Commands;
using Microsoft.AspNetCore.Authorization;
using Dtos.Users;
using Microsoft.AspNetCore.Identity;
using Domain;

namespace API.Controllers;


public class AccountController(IMediator mediator, IMapper mapper, SignInManager<User> signInManager) : BaseApiController
{
    [AllowAnonymous]
    [HttpPost("login", Name = "Login")]
    public async Task<ActionResult<LoginResponseDto>> Login(LoginRequestDto loginDto)
    {
        var loginCommand = mapper.Map<Login.Command>(loginDto);

        return Ok(await mediator.Send(loginCommand));
    }

    [AllowAnonymous]
    [HttpPost("register", Name = "Register")]
    public async Task<ActionResult> Register(RegisterRequestDto registerRequestDto)
    {
        var command = mapper.Map<Register.Command>(registerRequestDto);
        await mediator.Send(command);

        return NoContent();
    }

    [HttpPost("logout", Name = "Logout")]
    public async Task<ActionResult> Logout()
    {
        await signInManager.SignOutAsync();

        return NoContent();
    }


    [HttpGet(Name = "UserInfo")]
    public async Task<ActionResult<UserDto>> UserInfo()
    {
        throw new NotImplementedException();
    }
}