using MeetApp.Domain.Entities;
using MeetApp.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MeetApp.Infrastructure.Persistence.Repositories;

public class ProfileRepository(AppDbContext context) : GenericRepository<Profile>(context), IProfileRepository
{
    public async Task<Profile?> GetByEmailAsync(string email, CancellationToken ct = default) =>
        await _set.FirstOrDefaultAsync(p => p.Email == email, ct);

    public async Task<Profile?> GetByUsernameAsync(string username, CancellationToken ct = default) =>
        await _set.FirstOrDefaultAsync(p => p.Username == username, ct);

    public async Task<Profile?> GetByRefreshTokenAsync(string refreshToken, CancellationToken ct = default) =>
        await _set.FirstOrDefaultAsync(p => p.RefreshToken == refreshToken, ct);

    public async Task<bool> ExistsByEmailAsync(string email, CancellationToken ct = default) =>
        await _set.AnyAsync(p => p.Email == email, ct);

    public async Task<bool> ExistsByUsernameAsync(string username, CancellationToken ct = default) =>
        await _set.AnyAsync(p => p.Username == username, ct);
}
