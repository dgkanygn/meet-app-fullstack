using MeetApp.Domain.Enums;

namespace MeetApp.Application.Dtos.Notification;

public record NotificationResponse(
    Guid Id,
    Guid RecipientId,
    NotificationType Type,
    string Message,
    Guid? ReferenceId,
    bool IsRead,
    DateTime CreatedAt
);
