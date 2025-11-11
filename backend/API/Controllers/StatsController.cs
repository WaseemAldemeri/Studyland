using Application.Stats.Queries;
using Dtos.Stats;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class StatsController : BaseApiController
{
    [HttpGet(Name = "GetDashboardStats")]
    public async Task<ActionResult<StatsDto>> GetDashboardStats([FromQuery] GetDashboardStatsQueryDto queryParams)
    {
        var query = Mapper.Map<GetDashboardStats.Query>(queryParams);
        query.UserIds.Add(CurrentUserId);

        return Ok(await Mediator.Send(query));
    }
}