using Application.Guilds.Queries;
using Dtos.Guilds;
using Dtos.Users;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class GuildsController : BaseApiController
{
    [HttpGet("{id}", Name = "GetGuild")]
    public async Task<ActionResult<GuildDto>> GetGuild(Guid id)
    {
        var query = new GetGuidDetails.Query() {Id = id};

        return Ok(await Mediator.Send(query));
    }
    
    [HttpGet("{id}/members", Name = "GetGuildMembers")]
    public async Task<ActionResult<List<UserPressenceDto>>> GetGuildMembers(Guid id)
    {
        var query = new GetGuildMembers.Query() {Id = id};

        return Ok(await Mediator.Send(query));
    }

    [HttpGet("{id}/members/goals", Name = "GetGuildMembersGoals")]
    public async Task<ActionResult<List<UserDailyGoalDto>>> GetGuildMemebersGoals(Guid id)
    {
        var query = new GetGuildMembersGoals.Query() {Id = id};

        return Ok(await Mediator.Send(query));
    }
}