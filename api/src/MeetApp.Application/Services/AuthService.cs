using MeetApp.Application.Dtos;
using MeetApp.Application.Dtos.Auth;
using MeetApp.Application.Interfaces;
using MeetApp.Domain.Entities;
using MeetApp.Domain.Exceptions;
using MeetApp.Domain.Interfaces;

namespace MeetApp.Application.Services;

public class AuthService(
    IProfileRepository profileRepository,
    IPasswordHasher passwordHasher,
    ITokenService tokenService) : IAuthService
{
    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken ct = default)
    {
        if (await profileRepository.ExistsByEmailAsync(request.Email, ct))
            throw new BusinessException("This email is already in use.");
        if (await profileRepository.ExistsByUsernameAsync(request.Username, ct))
            throw new BusinessException("This username is already taken.");

        var profile = new Profile
        {
            Id = Guid.NewGuid(),
            Username = request.Username,
            Email = request.Email,
            FullName = request.FullName,
            PasswordHash = passwordHasher.Hash(request.Password),
            CreatedAt = DateTime.UtcNow
        };

        await profileRepository.AddAsync(profile, ct);
        await profileRepository.SaveChangesAsync(ct);

        return BuildAuthResponse(profile);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        var profile = await profileRepository.GetByEmailAsync(request.EmailOrUsername, ct)
            ?? await profileRepository.GetByUsernameAsync(request.EmailOrUsername, ct)
            ?? throw new UnauthorizedException("Invalid credentials.");

        if (!passwordHasher.Verify(request.Password, profile.PasswordHash))
            throw new UnauthorizedException("Invalid credentials.");

        return BuildAuthResponse(profile, save: true, profileRepository, ct);
    }

    public async Task<AuthResponse> RefreshTokenAsync(RefreshTokenRequest request, CancellationToken ct = default)
    {
        var profile = await profileRepository.GetByRefreshTokenAsync(request.RefreshToken, ct)
            ?? throw new UnauthorizedException("Invalid or expired refresh token.");

        if (profile.RefreshTokenExpiresAt < DateTime.UtcNow)
            throw new UnauthorizedException("Refresh token has expired.");

        return BuildAuthResponse(profile, save: true, profileRepository, ct);
    }

    public async Task LogoutAsync(RefreshTokenRequest request, CancellationToken ct = default)
    {
        var profile = await profileRepository.GetByRefreshTokenAsync(request.RefreshToken, ct);
        if (profile is null) return;

        profile.RefreshToken = null;
        profile.RefreshTokenExpiresAt = null;
        profileRepository.Update(profile);
        await profileRepository.SaveChangesAsync(ct);
    }

    // Helper
    private AuthResponse BuildAuthResponse(Profile profile, bool save = false,
        IProfileRepository? repo = null, CancellationToken ct = default)
    {
        var accessToken = tokenService.GenerateAccessToken(profile);
        var refreshToken = tokenService.GenerateRefreshToken();
        var expiry = tokenService.GetRefreshTokenExpiry();

        profile.RefreshToken = refreshToken;
        profile.RefreshTokenExpiresAt = expiry;

        if (save && repo is not null)
        {
            repo.Update(profile);
            _ = repo.SaveChangesAsync(ct);
        }

        var profileDto = new ProfileResponse(
            profile.Id, profile.Username, profile.Email,
            profile.FullName, profile.Bio, profile.AvatarUrl, profile.CreatedAt);

        return new AuthResponse(accessToken, refreshToken, expiry, profileDto);
    }
}
