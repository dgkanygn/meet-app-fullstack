using MeetApp.Domain.Entities;
using MeetApp.Domain.Enums;

namespace MeetApp.Domain.Interfaces;

public interface IConnectionRepository : IRepository<Connection>
{
    Task<IEnumerable<Connection>> GetByProfileIdAsync(Guid profileId, ConnectionStatus? status = null, CancellationToken ct = default);
    Task<Connection?> GetBetweenProfilesAsync(Guid requesterId, Guid addresseeId, CancellationToken ct = default);

    /// <summary>Requester ve Addressee profilleri yuklenmis halde tekil baglanti getirir.</summary>
    Task<Connection?> GetByIdWithProfilesAsync(Guid id, CancellationToken ct = default);
}
