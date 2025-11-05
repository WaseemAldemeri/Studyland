using Application.Topics.Queries;
using Dtos.Topics;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class TopicsController(IMediator mediator) : BaseApiController
{
    [HttpGet(Name = "GetTopics")]
    public async Task<ActionResult<List<TopicDto>>> GetAwards()
    {
        return Ok(await mediator.Send(new GetTopics.Query()));
    }
}