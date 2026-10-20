using MeetApp.Application.Dtos.Message;

namespace MeetApp.Application.Interfaces;

public interface IMessageService
{
    Task<DirectMessageResponse> SendMessageAsync(Guid senderId, SendMessageRequest request, CancellationToken ct = default);
    Task<IEnumerable<DirectMessageResponse>> GetConversationAsync(Guid currentUserId, Guid otherUserId, int limit = 100, CancellationToken ct = default);
    Task<IEnumerable<ConversationSummaryResponse>> GetConversationsAsync(Guid currentUserId, CancellationToken ct = default);
    Task MarkAsReadAsync(Guid currentUserId, Guid otherUserId, CancellationToken ct = default);
    Task<int> GetTotalUnreadCountAsync(Guid currentUserId, CancellationToken ct = default);
}
