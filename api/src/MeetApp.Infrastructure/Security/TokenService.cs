using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using MeetApp.Application.Interfaces;
using MeetApp.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace MeetApp.Infrastructure.Security;

public class TokenService(IConfiguration configuration) : ITokenService
{
    private readonly string _secret = configuration["Jwt:Secret"]
        ?? throw new InvalidOperationException("JWT secret is not configured.");
    private readonly string _issuer = configuration["Jwt:Issuer"] ?? "MeetApp";
    private readonly string _audience = configuration["Jwt:Audience"] ?? "MeetApp";
    private readonly int _accessTokenExpiryMinutes = int.Parse(configuration["Jwt:AccessTokenExpiryMinutes"] ?? "60");
    private readonly int _refreshTokenExpiryDays = int.Parse(configuration["Jwt:RefreshTokenExpiryDays"] ?? "30");

    public string GenerateAccessToken(Profile profile)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, profile.Id.ToString()),
            new(ClaimTypes.Email, profile.Email),
            new(ClaimTypes.Name, profile.Username),
            new("fullname", profile.FullName)
        };

        var token = new JwtSecurityToken(
            issuer: _issuer,
            audience: _audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_accessTokenExpiryMinutes),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string GenerateRefreshToken()
    {
        var bytes = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(bytes);
        return Convert.ToBase64String(bytes);
    }

    public Guid? ValidateAccessToken(string token)
    {
        try
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secret));
            var handler = new JwtSecurityTokenHandler();
            var principal = handler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = key,
                ValidateIssuer = true,
                ValidIssuer = _issuer,
                ValidateAudience = true,
                ValidAudience = _audience,
                ValidateLifetime = true
            }, out _);

            var id = principal.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
            return id is null ? null : Guid.Parse(id);
        }
        catch
        {
            return null;
        }
    }

    public DateTime GetRefreshTokenExpiry() => DateTime.UtcNow.AddDays(_refreshTokenExpiryDays);
}
