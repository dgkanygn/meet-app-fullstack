using MeetApp.Domain.Entities;

namespace MeetApp.Domain.Interfaces;

public interface IMeetingRepository : IRepository<Meeting>
{
    Task<Meeting?> GetByIdWithParticipantsAsync(Guid id, CancellationToken ct = default);
    Task<IEnumerable<Meeting>> GetByProfileIdAsync(Guid profileId, string? scope = null, CancellationToken ct = default);
}
