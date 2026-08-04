using MeetApp.Application.Dtos.CalendarNote;
using MeetApp.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MeetApp.Api.Controllers;

[Route("api/calendar-notes")]
[Authorize]
public class CalendarNoteController(ICalendarNoteService calendarNoteService) : BaseController
{
    [HttpGet]
    public async Task<IActionResult> GetNotes([FromQuery] int year, [FromQuery] int month, CancellationToken ct)
    {
        var result = await calendarNoteService.GetNotesByMonthAsync(CurrentUserId, year, month, ct);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCalendarNoteRequest request, CancellationToken ct)
    {
        var result = await calendarNoteService.CreateNoteAsync(CurrentUserId, request, ct);
        return Ok(result);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCalendarNoteRequest request, CancellationToken ct)
    {
        var result = await calendarNoteService.UpdateNoteAsync(id, CurrentUserId, request, ct);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await calendarNoteService.DeleteNoteAsync(id, CurrentUserId, ct);
        return NoContent();
    }
}
