namespace MeetApp.Application.Dtos.Meeting;

public record CreateMeetingRequest(
    string Title,
    string? Description,
    DateTime? ScheduledAt,
    bool IsInstant,
    string? Password,
    int MaxParticipants = 4
);

public record UpdateMeetingRequest(
    string? Title,
    string? Description,
    DateTime? ScheduledAt,
    string? Password,
    int? MaxParticipants
);

public record MeetingResponse(
    Guid Id,
    string Title,
    string? Description,
    Guid HostId,
    string HostFullName,
    DateTime? ScheduledAt,
    bool IsInstant,
    bool HasPassword,
    int MaxParticipants,
    DateTime CreatedAt
);

public record MeetingDetailResponse(
    Guid Id,
    string Title,
    string? Description,
    Guid HostId,
    string HostFullName,
    DateTime? ScheduledAt,
    bool IsInstant,
    bool HasPassword,
    int MaxParticipants,
    DateTime CreatedAt,
    IEnumerable<ParticipantResponse> Participants
);
