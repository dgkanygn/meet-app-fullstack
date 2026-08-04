using MeetApp.Api.Hubs;
using MeetApp.Application.Dtos.Notification;
using MeetApp.Application.Interfaces;
using Microsoft.AspNetCore.SignalR;

namespace MeetApp.Api.Realtime;

public class NotificationPublisher(IHubContext<NotificationHub> hubContext) : INotificationPublisher
{
    public async Task PublishAsync(Guid recipientId, NotificationResponse notification, CancellationToken ct = default)
    {
        await hubContext.Clients
            .Group($"user-{recipientId}")
            .SendAsync("ReceiveNotification", notification, ct);
    }
}
