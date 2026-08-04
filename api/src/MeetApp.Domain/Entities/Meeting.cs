using MeetApp.Domain.Enums;

namespace MeetApp.Domain.Entities;

public class Meeting
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid HostId { get; set; }
    public DateTime? ScheduledAt { get; set; }
    public bool IsInstant { get; set; }
    public string? Password { get; set; }
    public int MaxParticipants { get; set; } = 4;
    public DateTime CreatedAt { get; set; }

    // Navigation
    public Profile Host { get; set; } = null!;
    public ICollection<MeetingParticipant> Participants { get; set; } = [];
}
