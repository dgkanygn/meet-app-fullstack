using MeetApp.Domain.Entities;

namespace MeetApp.Domain.Interfaces;

public interface IMeetingParticipantRepository : IRepository<MeetingParticipant>
{
    Task<IEnumerable<MeetingParticipant>> GetByMeetingIdAsync(Guid meetingId, CancellationToken ct = default);
    Task<MeetingParticipant?> GetByMeetingAndProfileAsync(Guid meetingId, Guid profileId, CancellationToken ct = default);
}
