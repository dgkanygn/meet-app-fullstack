using MeetApp.Application.Dtos;

namespace MeetApp.Application.Interfaces;

public interface IProfileService
{
    Task<ProfileResponse> GetMyProfileAsync(Guid profileId, CancellationToken ct = default);
    Task<ProfileResponse> GetProfileByIdAsync(Guid id, CancellationToken ct = default);
    Task<ProfileResponse> UpdateMyProfileAsync(Guid profileId, UpdateProfileRequest request, CancellationToken ct = default);

    /// <summary>Kullanici adi / ad-soyad / e-posta uzerinden profil arar.</summary>
    Task<IEnumerable<ProfileSearchResponse>> SearchProfilesAsync(Guid requesterId, string term, int limit = 10, CancellationToken ct = default);

    /// <summary>Hesabi ve ona bagli tum verileri kalici olarak siler.</summary>
    Task DeleteMyAccountAsync(Guid profileId, string password, CancellationToken ct = default);
}
