using Application.ChatMessages.Queries;
using Dtos.Chat;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;


public class ChatMessagesController : BaseApiController
{

    [HttpGet(Name = "GetMessages")]
    public async Task<ActionResult<List<ChatMessageDto>>> GetMessages([FromQuery] Guid channelId)
    {
        var query = new GetChatMessages.Query() { ChannelId = channelId };
        return Ok(await Mediator.Send(query));
    }
}