using API.Services.ChatPressence;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

/// <summary>
/// THIS IS A DUMMY CONTROLLER.
/// Its only purpose is to expose SignalR DTOs to the OpenAPI/NSwag generator
/// so they are included in the auto-generated TypeScript client.
/// It should NOT be used by any client.
/// </summary>
public class SignalRContractsController : BaseApiController
{
    // Dummy method to "use" the DTOs
    [HttpGet(Name = "Types")]
    public Task<ActionResult<UserPressenceDto>> GetSignalRTypes()
    {
        // This code is never meant to be called.
        throw new NotImplementedException();
    }
}