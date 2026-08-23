using MeetApp.Application.Dtos;
using MeetApp.Application.Interfaces;
using MeetApp.Domain.Exceptions;
using MeetApp.Domain.Interfaces;

namespace MeetApp.Application.Services;

public class ProfileService(
    IProfileRepository profileRepository,
    IConnectionRepository connectionRepository,
    IPasswordHasher passwordHasher) : IProfileService
{
    private const int MinSearchTermLength = 2;

    public async Task<ProfileResponse> GetMyProfileAsync(Guid profileId, CancellationToken ct = default)
    {
        var profile = await profileRepository.GetByIdAsync(profileId, ct)
            ?? throw new NotFoundException("Profile", profileId);
        return ToResponse(profile);
    }

    public async Task<ProfileResponse> GetProfileByIdAsync(Guid id, CancellationToken ct = default)
    {
        var profile = await profileRepository.GetByIdAsync(id, ct)
            ?? throw new NotFoundException("Profile", id);
        return ToResponse(profile);
    }

    public async Task<ProfileResponse> UpdateMyProfileAsync(Guid profileId, UpdateProfileRequest request, CancellationToken ct = default)
    {
        var profile = await profileRepository.GetByIdAsync(profileId, ct)
            ?? throw new NotFoundException("Profile", profileId);

        if (request.FullName is not null) profile.FullName = request.FullName;
        if (request.Bio is not null) profile.Bio = request.Bio;
        if (request.AvatarUrl is not null) profile.AvatarUrl = request.AvatarUrl;

        profileRepository.Update(profile);
        await profileRepository.SaveChangesAsync(ct);
        return ToResponse(profile);
    }

    public async Task<IEnumerable<ProfileSearchResponse>> SearchProfilesAsync(Guid requesterId, string term, int limit = 10, CancellationToken ct = default)
    {
        term = term?.Trim() ?? string.Empty;
        if (term.Length < MinSearchTermLength) return [];

        limit = Math.Clamp(limit, 1, 50);

        var profiles = await profileRepository.SearchAsync(term, requesterId, limit, ct);

        // Arayan kullanicinin mevcut baglantilarini tek seferde cekip esletiyoruz;
        // boylece her sonuc icin ayri sorgu atilmiyor.
        var connections = await connectionRepository.GetByProfileIdAsync(requesterId, null, ct);
        var statusByProfileId = connections.ToDictionary(
            c => c.RequesterId == requesterId ? c.AddresseeId : c.RequesterId,
            c => c.Status);

        return profiles.Select(p => new ProfileSearchResponse(
            p.Id,
            p.Username,
            p.FullName,
            p.AvatarUrl,
            statusByProfileId.TryGetValue(p.Id, out var status) ? status : null));
    }

    public async Task DeleteMyAccountAsync(Guid profileId, string password, CancellationToken ct = default)
    {
        var profile = await profileRepository.GetByIdAsync(profileId, ct)
            ?? throw new NotFoundException("Profile", profileId);

        if (!passwordHasher.Verify(password, profile.PasswordHash))
            throw new ForbiddenException("Password is incorrect.");

        // Baglantilar Restrict ile yapilandirildigi icin profilden once elle silinmeli.
        var connections = await connectionRepository.GetByProfileIdAsync(profileId, null, ct);
        foreach (var connection in connections)
            connectionRepository.Remove(connection);
        await connectionRepository.SaveChangesAsync(ct);

        profileRepository.Remove(profile);
        await profileRepository.SaveChangesAsync(ct);
    }

    private static ProfileResponse ToResponse(Domain.Entities.Profile p) =>
        new(p.Id, p.Username, p.Email, p.FullName, p.Bio, p.AvatarUrl, p.CreatedAt);
}
