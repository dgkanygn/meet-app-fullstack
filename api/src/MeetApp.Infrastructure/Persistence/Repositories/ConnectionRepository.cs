using MeetApp.Domain.Entities;
using MeetApp.Domain.Enums;
using MeetApp.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MeetApp.Infrastructure.Persistence.Repositories;

public class ConnectionRepository(AppDbContext context) : GenericRepository<Connection>(context), IConnectionRepository
{
    public async Task<IEnumerable<Connection>> GetByProfileIdAsync(Guid profileId, ConnectionStatus? status = null, CancellationToken ct = default)
    {
        var query = _set
            .Include(c => c.Requester)
            .Include(c => c.Addressee)
            .Where(c => c.RequesterId == profileId || c.AddresseeId == profileId);

        if (status.HasValue)
            query = query.Where(c => c.Status == status.Value);

        return await query.ToListAsync(ct);
    }

    public async Task<Connection?> GetByIdWithProfilesAsync(Guid id, CancellationToken ct = default) =>
        await _set
            .Include(c => c.Requester)
            .Include(c => c.Addressee)
            .FirstOrDefaultAsync(c => c.Id == id, ct);

    public async Task<Connection?> GetBetweenProfilesAsync(Guid requesterId, Guid addresseeId, CancellationToken ct = default) =>
        await _set.FirstOrDefaultAsync(c =>
            (c.RequesterId == requesterId && c.AddresseeId == addresseeId) ||
            (c.RequesterId == addresseeId && c.AddresseeId == requesterId), ct);
}
