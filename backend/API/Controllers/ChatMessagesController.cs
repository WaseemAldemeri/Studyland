using Application.ChatMessages.Queries;
using Dtos;
using Dtos.Chat;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;


public class ChatMessagesController : BaseApiController
{
    [HttpGet(Name = "GetMessages")]
    public async Task<ActionResult<PagedList<ChatMessageDto, DateTimeOffset?>>>
        GetMessages([FromQuery] GetChatMessagesDto getChatMessagesDto)
    {
        var query = Mapper.Map<GetChatMessages.Query>(getChatMessagesDto);

        return Ok(await Mediator.Send(query));
    }
}