using MeetApp.Application.Dtos;
using MeetApp.Application.Dtos.Auth;
using MeetApp.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MeetApp.Api.Controllers;

[Route("api/profiles")]
[Authorize]
public class ProfileController(IProfileService profileService) : BaseController
{
    [HttpGet("me")]
    public async Task<IActionResult> GetMe(CancellationToken ct)
    {
        var result = await profileService.GetMyProfileAsync(CurrentUserId, ct);
        return Ok(result);
    }

    [HttpPut("me")]
    public async Task<IActionResult> UpdateMe([FromBody] UpdateProfileRequest request, CancellationToken ct)
    {
        var result = await profileService.UpdateMyProfileAsync(CurrentUserId, request, ct);
        return Ok(result);
    }

    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] string q, [FromQuery] int limit, CancellationToken ct)
    {
        var result = await profileService.SearchProfilesAsync(CurrentUserId, q ?? string.Empty, limit <= 0 ? 10 : limit, ct);
        return Ok(result);
    }

    [HttpDelete("me")]
    public async Task<IActionResult> DeleteMe([FromBody] DeleteAccountRequest request, CancellationToken ct)
    {
        await profileService.DeleteMyAccountAsync(CurrentUserId, request.Password, ct);
        return NoContent();
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await profileService.GetProfileByIdAsync(id, ct);
        return Ok(result);
    }
}
