using MeetApp.Domain.Entities;

namespace MeetApp.Application.Interfaces;

public interface ITokenService
{
    string GenerateAccessToken(Profile profile);
    string GenerateRefreshToken();
    Guid? ValidateAccessToken(string token);
    DateTime GetRefreshTokenExpiry();
}
