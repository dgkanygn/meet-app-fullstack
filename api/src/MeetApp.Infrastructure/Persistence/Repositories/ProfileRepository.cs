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

    public async Task<IEnumerable<Profile>> SearchAsync(string term, Guid excludeProfileId, int limit, CancellationToken ct = default)
    {
        var pattern = $"%{term}%";

        return await _set
            .Where(p => p.Id != excludeProfileId &&
                        (EF.Functions.ILike(p.Username, pattern) ||
                         EF.Functions.ILike(p.FullName, pattern) ||
                         EF.Functions.ILike(p.Email, pattern)))
            .OrderBy(p => p.Username)
            .Take(limit)
            .ToListAsync(ct);
    }
}
