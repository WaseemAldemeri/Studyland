using API.Features.Sessions;
using Application.Sessions.Commands;
using Application.Sessions.Queries;
using AutoMapper;
using Dtos.Sessions;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class SessionsController(IMediator mediator, IMapper mapper) : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<SessionDto>> GetSessions()
    {
        return Ok(await mediator.Send(new GetSessionsList.Query()));
    }

    [HttpPost]
    public async Task<ActionResult<string>> CreateSession(CreateSessionDto createSessionDto)
    {
        var command = mapper.Map<CreateSession.Command>(createSessionDto);
        command.UserId = "0fb74f54-6819-4dc3-93ba-b5d10a8d3a90";

        return Ok(await mediator.Send(command));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteSession(string id)
    {
        await mediator.Send(new DeleteSession.Command(id));

        return Ok();
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateSession(string id, UpdateSessionDto updateSessionDto)
    {
        var command = mapper.Map<UpdateSession.Command>(updateSessionDto);
        command.Id = id;

        await mediator.Send(command);

        return Ok();
    }
}
