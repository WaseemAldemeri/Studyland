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
        query.UserIds.Add(SessionsController.CurrentUserId);

        return Ok(await mediator.Send(query));
    }
}