using Application.Awards.Queries;
using Dtos.Awards;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class AwardsController : BaseApiController
{
    [HttpGet(Name = "GetAwards")]
    public async Task<ActionResult<List<AwardDto>>> GetAwards()
    {
        return Ok(await Mediator.Send(new GetAwards.Query()));
    }

    [HttpGet("milestones", Name = "GetMyMilestones")]
    public async Task<ActionResult<List<MilestoneDto>>> GetMyMilestones()
    {
        return Ok(await Mediator.Send(new GetMyMilestones.Query { UserId = CurrentUserId }));
    }
}