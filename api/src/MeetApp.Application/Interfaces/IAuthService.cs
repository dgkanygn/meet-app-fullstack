using MeetApp.Application.Dtos;
using MeetApp.Application.Dtos.Auth;

namespace MeetApp.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken ct = default);
    Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken ct = default);
    Task<AuthResponse> RefreshTokenAsync(RefreshTokenRequest request, CancellationToken ct = default);
    Task LogoutAsync(RefreshTokenRequest request, CancellationToken ct = default);

    /// <summary>Mevcut sifreyi dogrulayip yenisiyle degistirir ve tum oturumlari kapatir.</summary>
    Task ChangePasswordAsync(Guid profileId, ChangePasswordRequest request, CancellationToken ct = default);
}
