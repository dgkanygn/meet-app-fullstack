using MeetApp.Application.Dtos.Message;
using MeetApp.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MeetApp.Api.Controllers;

[Route("api/messages")]
[Authorize]
public class MessageController(IMessageService messageService) : BaseController
{
    [HttpGet("conversations")]
    public async Task<IActionResult> GetConversations(CancellationToken ct)
    {
        var result = await messageService.GetConversationsAsync(CurrentUserId, ct);
        return Ok(result);
    }

    [HttpGet("{otherUserId:guid}")]
    public async Task<IActionResult> GetConversation(Guid otherUserId, [FromQuery] int limit = 100, CancellationToken ct = default)
    {
        var result = await messageService.GetConversationAsync(CurrentUserId, otherUserId, limit, ct);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> SendMessage([FromBody] SendMessageRequest request, CancellationToken ct)
    {
        var result = await messageService.SendMessageAsync(CurrentUserId, request, ct);
        return Ok(result);
    }

    [HttpPost("{otherUserId:guid}/read")]
    public async Task<IActionResult> MarkAsRead(Guid otherUserId, CancellationToken ct)
    {
        await messageService.MarkAsReadAsync(CurrentUserId, otherUserId, ct);
        return NoContent();
    }

    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount(CancellationToken ct)
    {
        var count = await messageService.GetTotalUnreadCountAsync(CurrentUserId, ct);
        return Ok(new { unreadCount = count });
    }
}
