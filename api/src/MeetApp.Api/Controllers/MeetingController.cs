using MeetApp.Application.Dtos.Meeting;
using MeetApp.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

namespace MeetApp.Api.Controllers;

[Route("api/meetings")]
[Authorize]
public class MeetingController(IMeetingService meetingService, IConfiguration configuration) : BaseController
{
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateMeetingRequest request, CancellationToken ct)
    {
        var result = await meetingService.CreateMeetingAsync(CurrentUserId, request, ct);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpGet]
    public async Task<IActionResult> GetMyMeetings([FromQuery] string? scope, CancellationToken ct)
    {
        var result = await meetingService.GetMyMeetingsAsync(CurrentUserId, scope, ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await meetingService.GetMeetingByIdAsync(id, CurrentUserId, ct);
        return Ok(result);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateMeetingRequest request, CancellationToken ct)
    {
        var result = await meetingService.UpdateMeetingAsync(id, CurrentUserId, request, ct);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await meetingService.DeleteMeetingAsync(id, CurrentUserId, ct);
        return NoContent();
    }

    [HttpPost("{id:guid}/join")]
    public async Task<IActionResult> Join(Guid id, [FromBody] JoinMeetingRequest? request, CancellationToken ct)
    {
        await meetingService.JoinMeetingAsync(id, CurrentUserId, request?.Password, ct);
        return NoContent();
    }

    [HttpPost("{id:guid}/leave")]
    public async Task<IActionResult> Leave(Guid id, CancellationToken ct)
    {
        await meetingService.LeaveMeetingAsync(id, CurrentUserId, ct);
        return NoContent();
    }

    [HttpGet("ice-servers")]
    public IActionResult GetIceServers()
    {
        var stunUrl = configuration["WebRtc:StunUrl"] ?? "stun:stun.l.google.com:19302";
        var turnUrl = configuration["WebRtc:TurnUrl"];
        var turnUsername = configuration["WebRtc:TurnUsername"];
        var turnCredential = configuration["WebRtc:TurnCredential"];

        var iceServers = new List<object> { new { urls = stunUrl } };

        if (turnUrl is not null)
            iceServers.Add(new { urls = turnUrl, username = turnUsername, credential = turnCredential });

        return Ok(new { iceServers });
    }
}

public record JoinMeetingRequest(string? Password);
