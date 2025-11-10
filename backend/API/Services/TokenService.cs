using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Application.Interfaces;

using Domain;
using Microsoft.IdentityModel.Tokens;

namespace API.Services;


public class TokenService(IConfiguration config) : ITokenService
{
    private SymmetricSecurityKey _key = new(Encoding.UTF8.GetBytes(
        config["Jwt:SecretKey"]
        ?? throw new NullReferenceException("Jwt:SecretKey not found")
    ));

    private int _expirationMinutes = int.Parse(
        config["Jwt:ExpirationInMinutes"]
        ?? throw new NullReferenceException("Jwt:ExpirationInMinutes not found")
    );

    private string _issuer = config["Jwt:Issuer"]
        ?? throw new NullReferenceException("Jwt:Issuer not found");


    public string CreateToken(User user)
    {
        List<Claim> claims = [
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Name, user.DisplayName),
            new(ClaimTypes.Email, user.Email!),
        ];

        var creds = new SigningCredentials(_key, SecurityAlgorithms.HmacSha256);

        var tokenDescriptor = new SecurityTokenDescriptor()
        {

            Subject = new ClaimsIdentity(claims),
            SigningCredentials = creds,
            Expires = DateTime.UtcNow.AddMinutes(_expirationMinutes),
            Issuer = _issuer
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);

        return tokenHandler.WriteToken(token);
    }
}