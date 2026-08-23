namespace MeetApp.Application.Dtos;

public record ProfileResponse(
    Guid Id,
    string Username,
    string Email,
    string FullName,
    string? Bio,
    string? AvatarUrl,
    DateTime CreatedAt
);

public record UpdateProfileRequest(
    string? FullName,
    string? Bio,
    string? AvatarUrl
);

/// <summary>
/// Kullanici arama sonucu — e-posta gibi hassas alanlar disarida birakilir.
/// ConnectionStatus, arayan kullanici ile bu profil arasindaki mevcut baglanti
/// durumudur; hic baglanti yoksa null olur.
/// </summary>
public record ProfileSearchResponse(
    Guid Id,
    string Username,
    string FullName,
    string? AvatarUrl,
    Domain.Enums.ConnectionStatus? ConnectionStatus
);
