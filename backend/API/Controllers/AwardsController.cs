using Application.Awards.Queries;
using Dtos.Awards;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class AwardsController(IMediator mediator) : BaseApiController
{
    [HttpGet(Name = "GetAwards")]
    public async Task<ActionResult<List<AwardDto>>> GetAwards()
    {
        return Ok(await mediator.Send(new GetAwards.Query()));
    }
}