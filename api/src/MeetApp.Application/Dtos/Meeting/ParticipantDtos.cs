using MeetApp.Domain.Enums;

namespace MeetApp.Application.Dtos.Meeting;

public record InviteParticipantRequest(Guid ProfileId);

public record UpdateParticipantStatusRequest(MeetingParticipantStatus Status);

public record ParticipantResponse(
    Guid Id,
    Guid MeetingId,
    Guid ProfileId,
    string ProfileFullName,
    string ProfileUsername,
    string? ProfileAvatarUrl,
    MeetingParticipantStatus Status,
    DateTime InvitedAt,
    DateTime? RespondedAt
);
