using MeetApp.Application.Dtos.Meeting;
using MeetApp.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MeetApp.Api.Controllers;

[Route("api/meetings/{meetingId:guid}/participants")]
[Authorize]
public class MeetingParticipantController(IMeetingParticipantService participantService) : BaseController
{
    [HttpGet]
    public async Task<IActionResult> GetParticipants(Guid meetingId, CancellationToken ct)
    {
        var result = await participantService.GetParticipantsAsync(meetingId, ct);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Invite(Guid meetingId, [FromBody] InviteParticipantRequest request, CancellationToken ct)
    {
        var result = await participantService.InviteParticipantAsync(meetingId, CurrentUserId, request, ct);
        return Ok(result);
    }

    [HttpPut("{participantId:guid}")]
    public async Task<IActionResult> UpdateStatus(Guid meetingId, Guid participantId,
        [FromBody] UpdateParticipantStatusRequest request, CancellationToken ct)
    {
        var result = await participantService.UpdateParticipantStatusAsync(meetingId, participantId, CurrentUserId, request, ct);
        return Ok(result);
    }

    [HttpDelete("{participantId:guid}")]
    public async Task<IActionResult> Remove(Guid meetingId, Guid participantId, CancellationToken ct)
    {
        await participantService.RemoveParticipantAsync(meetingId, participantId, CurrentUserId, ct);
        return NoContent();
    }
}
