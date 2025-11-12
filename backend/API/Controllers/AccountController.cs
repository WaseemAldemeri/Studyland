using Microsoft.AspNetCore.Mvc;
using Dtos.Accounts;
using Application.Accounts.Commands;
using Microsoft.AspNetCore.Authorization;
using Dtos.Users;
using Microsoft.AspNetCore.Identity;
using Domain;

namespace API.Controllers;


public class AccountController(UserManager<User> userManager): BaseApiController
{
    [AllowAnonymous]
    [HttpPost("login", Name = "LoginUser")]
    public async Task<ActionResult<LoginResponseDto>> Login(LoginRequestDto loginDto)
    {
        var loginCommand = Mapper.Map<Login.Command>(loginDto);

        return Ok(await Mediator.Send(loginCommand));
    }

    [AllowAnonymous]
    [HttpPost("register", Name = "RegisterUser")]
    public async Task<ActionResult> Register(RegisterRequestDto registerRequestDto)
    {
        var command = Mapper.Map<Register.Command>(registerRequestDto);
        await Mediator.Send(command);

        return NoContent();
    }

    [AllowAnonymous]
    [HttpGet("current-use", Name = "GetCurrentUser")]
    public async Task<ActionResult<UserDto>> GetCurrentUser()
    {
        if (CurrentUserId == Guid.Empty)
        {
            // don't want to return unauthorized because this will be requested
            // as soon as the user hit's any page and we don't want to auto redirect
            return NoContent();
        }
        var user = await userManager.FindByIdAsync(CurrentUserId.ToString());

        if (user is null)
        {
            return Unauthorized();
        }

        var userDto = Mapper.Map<UserDto>(user);

        return Ok(userDto);
    }
}