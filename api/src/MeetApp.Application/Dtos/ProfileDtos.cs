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
