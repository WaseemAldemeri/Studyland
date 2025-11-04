using Dtos.Stats;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class StatsController(IMediator mediator) : BaseApiController
{
    [HttpGet(Name = "GetDashboardStats")]
    public async Task<ActionResult<StatsDto>> GetDashboardStats()
    {
    }
}