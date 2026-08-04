using MeetApp.Application.Dtos.Meeting;

namespace MeetApp.Application.Interfaces;

public interface IMeetingService
{
    Task<MeetingResponse> CreateMeetingAsync(Guid hostId, CreateMeetingRequest request, CancellationToken ct = default);
    Task<IEnumerable<MeetingResponse>> GetMyMeetingsAsync(Guid profileId, string? scope = null, CancellationToken ct = default);
    Task<MeetingDetailResponse> GetMeetingByIdAsync(Guid id, Guid requesterId, CancellationToken ct = default);
    Task<MeetingResponse> UpdateMeetingAsync(Guid id, Guid hostId, UpdateMeetingRequest request, CancellationToken ct = default);
    Task DeleteMeetingAsync(Guid id, Guid hostId, CancellationToken ct = default);
    Task JoinMeetingAsync(Guid id, Guid profileId, string? password = null, CancellationToken ct = default);
    Task LeaveMeetingAsync(Guid id, Guid profileId, CancellationToken ct = default);
    Task<bool> IsParticipantAsync(Guid meetingId, Guid profileId, CancellationToken ct = default);
}
