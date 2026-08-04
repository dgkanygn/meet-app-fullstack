using MeetApp.Application.Dtos.Connection;
using MeetApp.Domain.Enums;

namespace MeetApp.Application.Interfaces;

public interface IConnectionService
{
    Task<IEnumerable<ConnectionResponse>> GetConnectionsAsync(Guid profileId, ConnectionStatus? status = null, CancellationToken ct = default);
    Task<ConnectionResponse> CreateConnectionAsync(Guid requesterId, CreateConnectionRequest request, CancellationToken ct = default);
    Task<ConnectionResponse> UpdateConnectionAsync(Guid id, Guid requesterId, UpdateConnectionRequest request, CancellationToken ct = default);
    Task DeleteConnectionAsync(Guid id, Guid profileId, CancellationToken ct = default);
}
