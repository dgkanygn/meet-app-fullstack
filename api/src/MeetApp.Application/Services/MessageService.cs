using MeetApp.Application.Dtos.Message;
using MeetApp.Application.Interfaces;
using MeetApp.Domain.Entities;
using MeetApp.Domain.Exceptions;
using MeetApp.Domain.Interfaces;

namespace MeetApp.Application.Services;

public class MessageService(
    IDirectMessageRepository messageRepository,
    IProfileRepository profileRepository,
    IMessageRealtimeNotifier realtimeNotifier) : IMessageService
{
    private const int MaxMessageLength = 4000;

    public async Task<DirectMessageResponse> SendMessageAsync(Guid senderId, SendMessageRequest request, CancellationToken ct = default)
    {
        if (senderId == request.ReceiverId)
            throw new BusinessException("Cannot message yourself.");

        var content = request.Content?.Trim();
        if (string.IsNullOrWhiteSpace(content))
            throw new BusinessException("Message content cannot be empty.");

        if (content.Length > MaxMessageLength)
            throw new BusinessException($"Message content cannot exceed {MaxMessageLength} characters.");

        var receiver = await profileRepository.GetByIdAsync(request.ReceiverId, ct)
            ?? throw new NotFoundException("Profile", request.ReceiverId);

        var sender = await profileRepository.GetByIdAsync(senderId, ct)
            ?? throw new NotFoundException("Profile", senderId);

        var message = new DirectMessage
        {
            Id = Guid.NewGuid(),
            SenderId = senderId,
            ReceiverId = request.ReceiverId,
            Content = content,
            IsRead = false,
            CreatedAt = DateTime.UtcNow,
            Sender = sender,
            Receiver = receiver
        };

        await messageRepository.AddAsync(message, ct);
        await messageRepository.SaveChangesAsync(ct);

        var response = ToResponse(message);

        // Canlı bildirim: hem alıcıya hem de gönderene (diğer sekmeler için) ilet
        await realtimeNotifier.SendMessageAsync(request.ReceiverId, response, ct);
        await realtimeNotifier.SendMessageAsync(senderId, response, ct);

        return response;
    }

    public async Task<IEnumerable<DirectMessageResponse>> GetConversationAsync(Guid currentUserId, Guid otherUserId, int limit = 100, CancellationToken ct = default)
    {
        limit = Math.Clamp(limit, 1, 200);
        var messages = await messageRepository.GetConversationAsync(currentUserId, otherUserId, limit, ct);
        return messages.Select(ToResponse);
    }

    public async Task<IEnumerable<ConversationSummaryResponse>> GetConversationsAsync(Guid currentUserId, CancellationToken ct = default)
    {
        var latestMessages = await messageRepository.GetUserConversationsLatestAsync(currentUserId, ct);
        var result = new List<ConversationSummaryResponse>();

        foreach (var msg in latestMessages)
        {
            var isSender = msg.SenderId == currentUserId;
            var otherUser = isSender ? msg.Receiver : msg.Sender;
            if (otherUser == null) continue;

            var unreadCount = await messageRepository.GetUnreadCountFromSenderAsync(currentUserId, otherUser.Id, ct);

            result.Add(new ConversationSummaryResponse(
                otherUser.Id,
                otherUser.FullName,
                otherUser.Username,
                otherUser.AvatarUrl,
                msg.Content,
                msg.CreatedAt,
                unreadCount,
                msg.SenderId
            ));
        }

        return result.OrderByDescending(c => c.LastMessageAt);
    }

    public async Task MarkAsReadAsync(Guid currentUserId, Guid otherUserId, CancellationToken ct = default)
    {
        await messageRepository.MarkAsReadAsync(currentUserId, otherUserId, ct);
        await realtimeNotifier.NotifyMessagesReadAsync(otherUserId, currentUserId, ct);
    }

    public async Task<int> GetTotalUnreadCountAsync(Guid currentUserId, CancellationToken ct = default)
    {
        return await messageRepository.GetUnreadCountAsync(currentUserId, ct);
    }

    private static DirectMessageResponse ToResponse(DirectMessage m) =>
        new(
            m.Id,
            m.SenderId,
            m.Sender?.FullName ?? string.Empty,
            m.Sender?.Username ?? string.Empty,
            m.Sender?.AvatarUrl,
            m.ReceiverId,
            m.Receiver?.FullName ?? string.Empty,
            m.Receiver?.Username ?? string.Empty,
            m.Receiver?.AvatarUrl,
            m.Content,
            m.IsRead,
            m.CreatedAt
        );
}
