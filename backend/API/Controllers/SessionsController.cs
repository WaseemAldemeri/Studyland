using Application.Sessions.Commands;
using Application.Sessions.Queries;
using AutoMapper;
using Dtos.Sessions;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class SessionsController(IMediator mediator, IMapper mapper) : BaseApiController
{
    [HttpGet(Name = "GetSessionsList")]
    public async Task<ActionResult<List<SessionDto>>> GetSessions()
    {
        return Ok(await mediator.Send(new GetSessionsList.Query()));
    }

    [HttpPost(Name = "CreateSession")]
    public async Task<ActionResult<string>> CreateSession(CreateSessionDto createSessionDto)
    {
        var command = mapper.Map<CreateSession.Command>(createSessionDto);
        command.UserId = "0fb74f54-6819-4dc3-93ba-b5d10a8d3a90";

        return Ok(await mediator.Send(command));
    }

    [HttpDelete("{id}", Name = "DeleteSession")]
    public async Task<ActionResult> DeleteSession(string id)
    {
        await mediator.Send(new DeleteSession.Command(id));

        return Ok();
    }

    [HttpPut("{id}", Name = "UpdateSession")]
    public async Task<ActionResult> UpdateSession(string id, UpdateSessionDto updateSessionDto)
    {
        var command = mapper.Map<UpdateSession.Command>(updateSessionDto);
        command.Id = id;

        await mediator.Send(command);

        return Ok();
    }
}
