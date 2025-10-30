using Microsoft.AspNetCore.Mvc;
using Domain;
using MediatR;
using Application.Users.Queries;
using Dtos.Users;

namespace API.Controllers;

public class UsersController(IMediator mediator) : BaseApiController
{

    [HttpGet(Name = "GetUsers")]
    public async Task<ActionResult<List<UserDto>>> GetUsers()
    {
        var users = await mediator.Send(new GetUsersList.Query());
        return Ok(users);
    }

    [HttpGet("{id}", Name = "GetUserById")]
    public async Task<ActionResult<UserDto>> GetUser(string id)
    {
        var user = await mediator.Send(new GetUserById.Query(id));
        return Ok(user);
    }
}