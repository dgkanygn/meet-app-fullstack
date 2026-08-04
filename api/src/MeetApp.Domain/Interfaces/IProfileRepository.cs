using MeetApp.Domain.Entities;

namespace MeetApp.Domain.Interfaces;

public interface IProfileRepository : IRepository<Profile>
{
    Task<Profile?> GetByEmailAsync(string email, CancellationToken ct = default);
    Task<Profile?> GetByUsernameAsync(string username, CancellationToken ct = default);
    Task<Profile?> GetByRefreshTokenAsync(string refreshToken, CancellationToken ct = default);
    Task<bool> ExistsByEmailAsync(string email, CancellationToken ct = default);
    Task<bool> ExistsByUsernameAsync(string username, CancellationToken ct = default);
}
