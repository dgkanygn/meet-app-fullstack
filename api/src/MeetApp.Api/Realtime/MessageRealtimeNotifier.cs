using MeetApp.Api.Hubs;
using MeetApp.Application.Dtos.Message;
using MeetApp.Application.Interfaces;
using Microsoft.AspNetCore.SignalR;

namespace MeetApp.Api.Realtime;

public class MessageRealtimeNotifier(IHubContext<ChatHub> hubContext) : IMessageRealtimeNotifier
{
    public async Task SendMessageAsync(Guid recipientId, DirectMessageResponse message, CancellationToken ct = default)
    {
        await hubContext.Clients
            .Group($"user-{recipientId}")
            .SendAsync("ReceiveDirectMessage", message, ct);
    }

    public async Task NotifyMessagesReadAsync(Guid senderId, Guid readerId, CancellationToken ct = default)
    {
        await hubContext.Clients
            .Group($"user-{senderId}")
            .SendAsync("MessagesRead", new { readerId }, ct);
    }
}
