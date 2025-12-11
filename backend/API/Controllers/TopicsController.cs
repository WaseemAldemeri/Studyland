using Application.Topics.Commands;
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

    [HttpPost(Name = "CreateTopic")]
    public async Task<ActionResult<Guid>> Create([FromBody] CreateTopicDto createTopicDto)
    {
        var command = new CreateTopic.Command() { Title = createTopicDto.Title };
        return Ok(await Mediator.Send(command));
    }

}