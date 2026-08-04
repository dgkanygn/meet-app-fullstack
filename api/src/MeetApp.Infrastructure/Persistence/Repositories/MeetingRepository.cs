using MeetApp.Domain.Entities;
using MeetApp.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MeetApp.Infrastructure.Persistence.Repositories;

public class MeetingRepository(AppDbContext context) : GenericRepository<Meeting>(context), IMeetingRepository
{
    public async Task<Meeting?> GetByIdWithParticipantsAsync(Guid id, CancellationToken ct = default) =>
        await _set
            .Include(m => m.Host)
            .Include(m => m.Participants)
                .ThenInclude(p => p.Profile)
            .FirstOrDefaultAsync(m => m.Id == id, ct);

    public async Task<IEnumerable<Meeting>> GetByProfileIdAsync(Guid profileId, string? scope = null, CancellationToken ct = default)
    {
        var now = DateTime.UtcNow;
        var query = _set
            .Include(m => m.Host)
            .Where(m => m.HostId == profileId || m.Participants.Any(p => p.ProfileId == profileId));

        query = scope switch
        {
            "hosted" => query.Where(m => m.HostId == profileId),
            "upcoming" => query.Where(m => m.ScheduledAt == null || m.ScheduledAt > now),
            "past" => query.Where(m => m.ScheduledAt != null && m.ScheduledAt <= now),
            _ => query
        };

        return await query.OrderByDescending(m => m.CreatedAt).ToListAsync(ct);
    }
}
