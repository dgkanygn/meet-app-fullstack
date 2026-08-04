using MeetApp.Domain.Entities;

namespace MeetApp.Domain.Interfaces;

public interface INotificationRepository : IRepository<Notification>
{
    Task<IEnumerable<Notification>> GetByRecipientIdAsync(Guid recipientId, bool? isRead = null, CancellationToken ct = default);
    Task MarkAllAsReadAsync(Guid recipientId, CancellationToken ct = default);
}
