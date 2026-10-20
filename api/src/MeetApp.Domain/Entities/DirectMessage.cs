namespace MeetApp.Domain.Entities;

public class DirectMessage
{
    public Guid Id { get; set; }
    public Guid SenderId { get; set; }
    public Guid ReceiverId { get; set; }
    public string Content { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }

    // Navigation
    public Profile Sender { get; set; } = null!;
    public Profile Receiver { get; set; } = null!;
}
