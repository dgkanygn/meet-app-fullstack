using MeetApp.Application.Dtos;
using MeetApp.Application.Interfaces;
using MeetApp.Domain.Exceptions;
using MeetApp.Domain.Interfaces;

namespace MeetApp.Application.Services;

public class ProfileService(IProfileRepository profileRepository) : IProfileService
{
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

    private static ProfileResponse ToResponse(Domain.Entities.Profile p) =>
        new(p.Id, p.Username, p.Email, p.FullName, p.Bio, p.AvatarUrl, p.CreatedAt);
}
