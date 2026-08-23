namespace MeetApp.Application.Dtos.Auth;

public record ChangePasswordRequest(
    string CurrentPassword,
    string NewPassword
);

public record DeleteAccountRequest(string Password);
