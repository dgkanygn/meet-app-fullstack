using MeetApp.Application.Dtos;
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

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await profileService.GetProfileByIdAsync(id, ct);
        return Ok(result);
    }
}
