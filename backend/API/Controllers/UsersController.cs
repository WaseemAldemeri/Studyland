using Microsoft.AspNetCore.Mvc;
using Application.Users.Queries;
using Dtos.Users;

namespace API.Controllers;

public class UsersController : BaseApiController
{

    [HttpGet(Name = "GetUsers")]
    public async Task<ActionResult<List<UserDto>>> GetUsers()
    {
        var users = await Mediator.Send(new GetUsersList.Query());
        return Ok(users);
    }

    [HttpGet("{id}", Name = "GetUserById")]
    public async Task<ActionResult<UserDto>> GetUser(Guid id)
    {
        var user = await Mediator.Send(new GetUserById.Query(id));
        return Ok(user);
    }
}