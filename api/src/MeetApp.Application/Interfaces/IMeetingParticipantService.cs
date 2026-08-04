using MeetApp.Application.Dtos.Meeting;

namespace MeetApp.Application.Interfaces;

public interface IMeetingParticipantService
{
    Task<IEnumerable<ParticipantResponse>> GetParticipantsAsync(Guid meetingId, CancellationToken ct = default);
    Task<ParticipantResponse> InviteParticipantAsync(Guid meetingId, Guid hostId, InviteParticipantRequest request, CancellationToken ct = default);
    Task<ParticipantResponse> UpdateParticipantStatusAsync(Guid meetingId, Guid participantId, Guid requesterId, UpdateParticipantStatusRequest request, CancellationToken ct = default);
    Task RemoveParticipantAsync(Guid meetingId, Guid participantId, Guid hostId, CancellationToken ct = default);
}
