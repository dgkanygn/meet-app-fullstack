using MeetApp.Domain.Entities;
using MeetApp.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MeetApp.Infrastructure.Persistence.Repositories;

public class NotificationRepository(AppDbContext context) : GenericRepository<Notification>(context), INotificationRepository
{
    public async Task<IEnumerable<Notification>> GetByRecipientIdAsync(Guid recipientId, bool? isRead = null, CancellationToken ct = default)
    {
        var query = _set.Where(n => n.RecipientId == recipientId);
        if (isRead.HasValue) query = query.Where(n => n.IsRead == isRead.Value);
        return await query.OrderByDescending(n => n.CreatedAt).ToListAsync(ct);
    }

    public async Task MarkAllAsReadAsync(Guid recipientId, CancellationToken ct = default)
    {
        await _set
            .Where(n => n.RecipientId == recipientId && !n.IsRead)
            .ExecuteUpdateAsync(s => s.SetProperty(n => n.IsRead, true), ct);
    }
}
