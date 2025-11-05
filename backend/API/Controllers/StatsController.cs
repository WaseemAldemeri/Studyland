using Application.Stats.Queries;
using AutoMapper;
using Dtos.Stats;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class StatsController(IMediator mediator, IMapper mapper) : BaseApiController
{
    [HttpGet(Name = "GetDashboardStats")]
    public async Task<ActionResult<StatsDto>> GetDashboardStats([FromQuery] GetDashboardStatsQueryDto queryParams)
    {
        var query = mapper.Map<GetDashboardStats.Query>(queryParams);
        query.UserIds.Add(new Guid("5e601154-573b-479b-a0f0-e722951f54ab"));

        return Ok(await mediator.Send(query));
    }
}