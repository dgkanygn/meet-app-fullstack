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

        // Token'lar profile uzerine yazildiktan sonra tek SaveChanges ile kaydedilir;
        // aksi halde yeni kaydin refresh token'i veritabanina hic yazilmaz.
        var response = IssueTokens(profile);
        await profileRepository.SaveChangesAsync(ct);

        return response;
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        var profile = await profileRepository.GetByEmailAsync(request.EmailOrUsername, ct)
            ?? await profileRepository.GetByUsernameAsync(request.EmailOrUsername, ct)
            ?? throw new UnauthorizedException("Invalid credentials.");

        if (!passwordHasher.Verify(request.Password, profile.PasswordHash))
            throw new UnauthorizedException("Invalid credentials.");

        var response = IssueTokens(profile);
        profileRepository.Update(profile);
        await profileRepository.SaveChangesAsync(ct);

        return response;
    }

    public async Task<AuthResponse> RefreshTokenAsync(RefreshTokenRequest request, CancellationToken ct = default)
    {
        var profile = await profileRepository.GetByRefreshTokenAsync(request.RefreshToken, ct)
            ?? throw new UnauthorizedException("Invalid or expired refresh token.");

        if (profile.RefreshTokenExpiresAt < DateTime.UtcNow)
            throw new UnauthorizedException("Refresh token has expired.");

        var response = IssueTokens(profile);
        profileRepository.Update(profile);
        await profileRepository.SaveChangesAsync(ct);

        return response;
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

    public async Task ChangePasswordAsync(Guid profileId, ChangePasswordRequest request, CancellationToken ct = default)
    {
        var profile = await profileRepository.GetByIdAsync(profileId, ct)
            ?? throw new NotFoundException("Profile", profileId);

        if (!passwordHasher.Verify(request.CurrentPassword, profile.PasswordHash))
            throw new ForbiddenException("Current password is incorrect.");

        if (request.NewPassword.Length < 6)
            throw new BusinessException("New password must be at least 6 characters.");

        profile.PasswordHash = passwordHasher.Hash(request.NewPassword);

        // Sifre degisince eski refresh token gecersiz kilinir.
        profile.RefreshToken = null;
        profile.RefreshTokenExpiresAt = null;

        profileRepository.Update(profile);
        await profileRepository.SaveChangesAsync(ct);
    }

    /// <summary>
    /// Yeni access/refresh token uretir ve refresh token'i profile yazar.
    /// Kaydetme islemi cagirana birakilir.
    /// </summary>
    private AuthResponse IssueTokens(Profile profile)
    {
        var accessToken = tokenService.GenerateAccessToken(profile);
        var refreshToken = tokenService.GenerateRefreshToken();
        var expiry = tokenService.GetRefreshTokenExpiry();

        profile.RefreshToken = refreshToken;
        profile.RefreshTokenExpiresAt = expiry;

        var profileDto = new ProfileResponse(
            profile.Id, profile.Username, profile.Email,
            profile.FullName, profile.Bio, profile.AvatarUrl, profile.CreatedAt);

        return new AuthResponse(accessToken, refreshToken, expiry, profileDto);
    }
}
