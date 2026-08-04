using MeetApp.Application.Dtos.Notification;

namespace MeetApp.Application.Interfaces;

public interface INotificationService
{
    Task<IEnumerable<NotificationResponse>> GetNotificationsAsync(Guid profileId, bool? isRead = null, CancellationToken ct = default);
    Task MarkAsReadAsync(Guid id, Guid profileId, CancellationToken ct = default);
    Task MarkAllAsReadAsync(Guid profileId, CancellationToken ct = default);
}
