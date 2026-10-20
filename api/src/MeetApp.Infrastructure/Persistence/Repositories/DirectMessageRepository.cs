using MeetApp.Domain.Entities;
using MeetApp.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MeetApp.Infrastructure.Persistence.Repositories;

public class DirectMessageRepository(AppDbContext context) : GenericRepository<DirectMessage>(context), IDirectMessageRepository
{
    public async Task<IEnumerable<DirectMessage>> GetConversationAsync(Guid userA, Guid userB, int limit = 100, CancellationToken ct = default)
    {
        var messages = await _set
            .Include(m => m.Sender)
            .Include(m => m.Receiver)
            .Where(m => (m.SenderId == userA && m.ReceiverId == userB) || (m.SenderId == userB && m.ReceiverId == userA))
            .OrderByDescending(m => m.CreatedAt)
            .Take(limit)
            .ToListAsync(ct);

        messages.Reverse();
        return messages;
    }

    public async Task<IEnumerable<DirectMessage>> GetUserConversationsLatestAsync(Guid userId, CancellationToken ct = default)
    {
        var userMessages = await _set
            .Include(m => m.Sender)
            .Include(m => m.Receiver)
            .Where(m => m.SenderId == userId || m.ReceiverId == userId)
            .OrderByDescending(m => m.CreatedAt)
            .ToListAsync(ct);

        var latestPerPartner = userMessages
            .GroupBy(m => m.SenderId == userId ? m.ReceiverId : m.SenderId)
            .Select(g => g.First())
            .ToList();

        return latestPerPartner;
    }

    public async Task<int> GetUnreadCountAsync(Guid recipientId, CancellationToken ct = default) =>
        await _set.CountAsync(m => m.ReceiverId == recipientId && !m.IsRead, ct);

    public async Task<int> GetUnreadCountFromSenderAsync(Guid recipientId, Guid senderId, CancellationToken ct = default) =>
        await _set.CountAsync(m => m.ReceiverId == recipientId && m.SenderId == senderId && !m.IsRead, ct);

    public async Task MarkAsReadAsync(Guid recipientId, Guid senderId, CancellationToken ct = default)
    {
        var unread = await _set
            .Where(m => m.ReceiverId == recipientId && m.SenderId == senderId && !m.IsRead)
            .ToListAsync(ct);

        if (unread.Count > 0)
        {
            foreach (var msg in unread)
            {
                msg.IsRead = true;
            }
            await _context.SaveChangesAsync(ct);
        }
    }
}
