using MeetApp.Application.Dtos;

namespace MeetApp.Application.Interfaces;

public interface IProfileService
{
    Task<ProfileResponse> GetMyProfileAsync(Guid profileId, CancellationToken ct = default);
    Task<ProfileResponse> GetProfileByIdAsync(Guid id, CancellationToken ct = default);
    Task<ProfileResponse> UpdateMyProfileAsync(Guid profileId, UpdateProfileRequest request, CancellationToken ct = default);
}
