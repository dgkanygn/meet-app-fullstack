namespace MeetApp.Application.Dtos.Message;

public record DirectMessageResponse(
    Guid Id,
    Guid SenderId,
    string SenderFullName,
    string SenderUsername,
    string? SenderAvatarUrl,
    Guid ReceiverId,
    string ReceiverFullName,
    string ReceiverUsername,
    string? ReceiverAvatarUrl,
    string Content,
    bool IsRead,
    DateTime CreatedAt);

public record SendMessageRequest(
    Guid ReceiverId,
    string Content);

public record ConversationSummaryResponse(
    Guid OtherUserId,
    string OtherUserFullName,
    string OtherUserUsername,
    string? OtherUserAvatarUrl,
    string LastMessage,
    DateTime LastMessageAt,
    int UnreadCount,
    Guid LastMessageSenderId);
