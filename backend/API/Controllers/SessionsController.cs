using Application.Sessions.Commands;
using Application.Sessions.Queries;
using AutoMapper;
using Dtos.Sessions;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class SessionsController(IMediator mediator, IMapper mapper) : BaseApiController
{
    public static Guid CurrentUserId { get; set; } = new ("5e601154-573b-479b-a0f0-e722951f54ab");

    [HttpGet(Name = "GetSessions")]
    public async Task<ActionResult<List<SessionDto>>> GetSessions([FromQuery] GetSessionsQueryDto queryDto)
    {
        var requestedDate = queryDto.Date.HasValue ? DateOnly.FromDateTime((DateTime)queryDto.Date) : DateOnly.FromDateTime(DateTime.UtcNow);
        GetSessions.Query query = new() { Date = requestedDate, UserId = CurrentUserId };

        return Ok(await mediator.Send(query));
    }
    
    [HttpPost(Name = "CreateSession")]
    public async Task<ActionResult<Guid>> CreateSession(CreateSessionDto createSessionDto)
    {
        var command = mapper.Map<CreateSession.Command>(createSessionDto);
        command.UserId = CurrentUserId;

        return Ok(await mediator.Send(command));
    }

    [HttpDelete("{id}", Name = "DeleteSession")]
    public async Task<ActionResult> DeleteSession(Guid id)
    {
        await mediator.Send(new DeleteSession.Command(id));

        return Ok();
    }

    [HttpPut("{id}", Name = "UpdateSession")]
    public async Task<ActionResult> UpdateSession(Guid id, UpdateSessionDto updateSessionDto)
    {
        var command = mapper.Map<UpdateSession.Command>(updateSessionDto);
        command.Id = id;

        await mediator.Send(command);

        return Ok();
    }
}
