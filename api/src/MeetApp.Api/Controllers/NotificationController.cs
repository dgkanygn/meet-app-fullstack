using MeetApp.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MeetApp.Api.Controllers;

[Route("api/notifications")]
[Authorize]
public class NotificationController(INotificationService notificationService) : BaseController
{
    [HttpGet]
    public async Task<IActionResult> GetNotifications([FromQuery] bool? isRead, CancellationToken ct)
    {
        var result = await notificationService.GetNotificationsAsync(CurrentUserId, isRead, ct);
        return Ok(result);
    }

    [HttpPut("{id:guid}/read")]
    public async Task<IActionResult> MarkAsRead(Guid id, CancellationToken ct)
    {
        await notificationService.MarkAsReadAsync(id, CurrentUserId, ct);
        return NoContent();
    }

    [HttpPut("read-all")]
    public async Task<IActionResult> MarkAllAsRead(CancellationToken ct)
    {
        await notificationService.MarkAllAsReadAsync(CurrentUserId, ct);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await notificationService.DeleteNotificationAsync(id, CurrentUserId, ct);
        return NoContent();
    }
}
