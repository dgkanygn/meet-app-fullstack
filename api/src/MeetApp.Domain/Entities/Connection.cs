using MeetApp.Domain.Enums;

namespace MeetApp.Domain.Entities;

public class Connection
{
    public Guid Id { get; set; }
    public Guid RequesterId { get; set; }
    public Guid AddresseeId { get; set; }
    public ConnectionStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }

    // Navigation
    public Profile Requester { get; set; } = null!;
    public Profile Addressee { get; set; } = null!;
}
