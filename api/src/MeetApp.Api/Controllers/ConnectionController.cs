using MeetApp.Application.Dtos.Connection;
using MeetApp.Application.Interfaces;
using MeetApp.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MeetApp.Api.Controllers;

[Route("api/connections")]
[Authorize]
public class ConnectionController(IConnectionService connectionService) : BaseController
{
    [HttpGet]
    public async Task<IActionResult> GetConnections([FromQuery] ConnectionStatus? status, CancellationToken ct)
    {
        var result = await connectionService.GetConnectionsAsync(CurrentUserId, status, ct);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateConnectionRequest request, CancellationToken ct)
    {
        var result = await connectionService.CreateConnectionAsync(CurrentUserId, request, ct);
        return Ok(result);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateConnectionRequest request, CancellationToken ct)
    {
        var result = await connectionService.UpdateConnectionAsync(id, CurrentUserId, request, ct);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await connectionService.DeleteConnectionAsync(id, CurrentUserId, ct);
        return NoContent();
    }
}
