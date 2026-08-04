namespace MeetApp.Application.Dtos.Auth;

public record RegisterRequest(
    string Username,
    string Email,
    string FullName,
    string Password
);

public record LoginRequest(
    string EmailOrUsername,
    string Password
);

public record RefreshTokenRequest(string RefreshToken);

public record AuthResponse(
    string AccessToken,
    string RefreshToken,
    DateTime ExpiresAt,
    ProfileResponse Profile
);
