using MeetApp.Domain.Entities;

namespace MeetApp.Domain.Interfaces;

public interface IDirectMessageRepository : IRepository<DirectMessage>
{
    Task<IEnumerable<DirectMessage>> GetConversationAsync(Guid userA, Guid userB, int limit = 100, CancellationToken ct = default);
    Task<IEnumerable<DirectMessage>> GetUserConversationsLatestAsync(Guid userId, CancellationToken ct = default);
    Task<int> GetUnreadCountAsync(Guid recipientId, CancellationToken ct = default);
    Task<int> GetUnreadCountFromSenderAsync(Guid recipientId, Guid senderId, CancellationToken ct = default);
    Task MarkAsReadAsync(Guid recipientId, Guid senderId, CancellationToken ct = default);
}
