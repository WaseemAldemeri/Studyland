using Microsoft.AspNetCore.Mvc;
using Application.Users.Queries;
using Dtos.Users;
using Application.Users.Commands;
using Microsoft.AspNetCore.Authorization;
using Domain;

namespace API.Controllers;

public class UsersController : BaseApiController
{

    // dev endpoint
    [AllowAnonymous]
    [HttpGet(Name = "GetUsers")]
    public async Task<ActionResult<List<User>>> GetUsers()
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

    [HttpPatch("DailyGoal", Name = "UpdateDailyGoal")]
    public async Task<ActionResult> UpdateDailyGoal([FromBody]long dailyGoalMs)
    {
        var command = new UpdateDailyGoal.Command()
        {
            UserId = CurrentUserId,
            DailyGoal = TimeSpan.FromMilliseconds(dailyGoalMs)
        };
        await Mediator.Send(command);

        return NoContent();
    }
}