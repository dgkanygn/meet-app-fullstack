using MeetApp.Application.Dtos.Notification;

namespace MeetApp.Application.Interfaces;

public interface INotificationPublisher
{
    Task PublishAsync(Guid recipientId, NotificationResponse notification, CancellationToken ct = default);
}
