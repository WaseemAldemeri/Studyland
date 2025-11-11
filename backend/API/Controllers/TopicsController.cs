using Application.Topics.Queries;
using Dtos.Topics;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class TopicsController : BaseApiController
{
    [HttpGet(Name = "GetTopics")]
    public async Task<ActionResult<List<TopicDto>>> GetAwards()
    {
        return Ok(await Mediator.Send(new GetTopics.Query()));
    }
}