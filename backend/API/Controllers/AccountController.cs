using Microsoft.AspNetCore.Mvc;
using Dtos.Accounts;
using Application.Accounts.Commands;
using Microsoft.AspNetCore.Authorization;
using Dtos.Users;

namespace API.Controllers;


public class AccountController: BaseApiController
{
    [AllowAnonymous]
    [HttpPost("login", Name = "Login")]
    public async Task<ActionResult<LoginResponseDto>> Login(LoginRequestDto loginDto)
    {
        var loginCommand = Mapper.Map<Login.Command>(loginDto);

        return Ok(await Mediator.Send(loginCommand));
    }

    [AllowAnonymous]
    [HttpPost("register", Name = "Register")]
    public async Task<ActionResult> Register(RegisterRequestDto registerRequestDto)
    {
        var command = Mapper.Map<Register.Command>(registerRequestDto);
        await Mediator.Send(command);

        return NoContent();
    }

    [HttpGet(Name = "UserInfo")]
    public async Task<ActionResult<UserDto>> UserInfo()
    {
        throw new NotImplementedException();
    }
}