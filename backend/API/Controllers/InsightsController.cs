using Application.Insights.Queries;
using Dtos.Insights;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class InsightsController : BaseApiController
{
    [HttpGet("records", Name = "GetPersonalRecords")]
    public async Task<ActionResult<PersonalRecordsDto>> GetPersonalRecords()
    {
        return Ok(await Mediator.Send(new GetPersonalRecords.Query { UserId = CurrentUserId }));
    }

    [HttpGet("heatmap", Name = "GetStudyHeatmap")]
    public async Task<ActionResult<HeatmapDto>> GetStudyHeatmap([FromQuery] int days = 365)
    {
        return Ok(await Mediator.Send(new GetStudyHeatmap.Query { UserId = CurrentUserId, Days = days }));
    }

    [HttpGet("recap", Name = "GetRecap")]
    public async Task<ActionResult<RecapDto>> GetRecap([FromQuery] string period = "week")
    {
        return Ok(await Mediator.Send(new GetRecap.Query { UserId = CurrentUserId, Period = period }));
    }
}
