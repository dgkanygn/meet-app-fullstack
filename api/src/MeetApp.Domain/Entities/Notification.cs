using MeetApp.Domain.Enums;

namespace MeetApp.Domain.Entities;

public class Notification
{
    public Guid Id { get; set; }
    public Guid RecipientId { get; set; }
    public NotificationType Type { get; set; }
    public string Message { get; set; } = string.Empty;
    public Guid? ReferenceId { get; set; }
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }

    // Navigation
    public Profile Recipient { get; set; } = null!;
}
