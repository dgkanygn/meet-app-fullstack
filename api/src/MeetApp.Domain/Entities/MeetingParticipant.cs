using MeetApp.Domain.Enums;

namespace MeetApp.Domain.Entities;

public class MeetingParticipant
{
    public Guid Id { get; set; }
    public Guid MeetingId { get; set; }
    public Guid ProfileId { get; set; }
    public MeetingParticipantStatus Status { get; set; }
    public DateTime InvitedAt { get; set; }
    public DateTime? RespondedAt { get; set; }

    // Navigation
    public Meeting Meeting { get; set; } = null!;
    public Profile Profile { get; set; } = null!;
}
