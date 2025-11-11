using Application.Sessions.Commands;
using Application.Sessions.Queries;
using Dtos.Sessions;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class SessionsController : BaseApiController
{
    [HttpGet(Name = "GetSessions")]
    public async Task<ActionResult<List<SessionDto>>> GetSessions([FromQuery] GetSessionsQueryDto queryDto)
    {
        var requestedDate = queryDto.Date.HasValue ? DateOnly.FromDateTime((DateTime)queryDto.Date) : DateOnly.FromDateTime(DateTime.UtcNow);
        GetSessions.Query query = new() { Date = requestedDate, UserId = CurrentUserId };

        return Ok(await Mediator.Send(query));
    }
    
    [HttpPost(Name = "CreateSession")]
    public async Task<ActionResult<Guid>> CreateSession(CreateSessionDto createSessionDto)
    {
        var command = Mapper.Map<CreateSession.Command>(createSessionDto);
        command.UserId = CurrentUserId;

        return Ok(await Mediator.Send(command));
    }

    [HttpDelete("{id}", Name = "DeleteSession")]
    public async Task<ActionResult> DeleteSession(Guid id)
    {
        await Mediator.Send(new DeleteSession.Command(id));

        return Ok();
    }

    [HttpPut("{id}", Name = "UpdateSession")]
    public async Task<ActionResult> UpdateSession(Guid id, UpdateSessionDto updateSessionDto)
    {
        var command = Mapper.Map<UpdateSession.Command>(updateSessionDto);
        command.Id = id;

        await Mediator.Send(command);

        return Ok();
    }
}
