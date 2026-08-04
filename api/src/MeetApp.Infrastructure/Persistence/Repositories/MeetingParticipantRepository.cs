using MeetApp.Domain.Entities;
using MeetApp.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MeetApp.Infrastructure.Persistence.Repositories;

public class MeetingParticipantRepository(AppDbContext context) : GenericRepository<MeetingParticipant>(context), IMeetingParticipantRepository
{
    public async Task<IEnumerable<MeetingParticipant>> GetByMeetingIdAsync(Guid meetingId, CancellationToken ct = default) =>
        await _set
            .Include(p => p.Profile)
            .Where(p => p.MeetingId == meetingId)
            .ToListAsync(ct);

    public async Task<MeetingParticipant?> GetByMeetingAndProfileAsync(Guid meetingId, Guid profileId, CancellationToken ct = default) =>
        await _set.FirstOrDefaultAsync(p => p.MeetingId == meetingId && p.ProfileId == profileId, ct);
}
