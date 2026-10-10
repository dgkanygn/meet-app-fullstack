using MeetApp.Application.Dtos.Notification;
using MeetApp.Application.Interfaces;
using MeetApp.Domain.Exceptions;
using MeetApp.Domain.Interfaces;

namespace MeetApp.Application.Services;

public class NotificationService(INotificationRepository notificationRepository) : INotificationService
{
    public async Task<IEnumerable<NotificationResponse>> GetNotificationsAsync(Guid profileId, bool? isRead = null, CancellationToken ct = default)
    {
        var notifications = await notificationRepository.GetByRecipientIdAsync(profileId, isRead, ct);
        return notifications.Select(n => new NotificationResponse(
            n.Id, n.RecipientId, n.Type, n.Message, n.ReferenceId, n.IsRead, n.CreatedAt));
    }

    public async Task MarkAsReadAsync(Guid id, Guid profileId, CancellationToken ct = default)
    {
        var notification = await notificationRepository.GetByIdAsync(id, ct)
            ?? throw new NotFoundException("Notification", id);

        if (notification.RecipientId != profileId)
            throw new ForbiddenException("Cannot mark another user's notification as read.");

        notification.IsRead = true;
        notificationRepository.Update(notification);
        await notificationRepository.SaveChangesAsync(ct);
    }

    public async Task MarkAllAsReadAsync(Guid profileId, CancellationToken ct = default)
    {
        await notificationRepository.MarkAllAsReadAsync(profileId, ct);
    }

    public async Task DeleteNotificationAsync(Guid id, Guid profileId, CancellationToken ct = default)
    {
        var notification = await notificationRepository.GetByIdAsync(id, ct)
            ?? throw new NotFoundException("Notification", id);

        if (notification.RecipientId != profileId)
            throw new ForbiddenException("Cannot delete another user's notification.");

        notificationRepository.Remove(notification);
        await notificationRepository.SaveChangesAsync(ct);
    }
}
