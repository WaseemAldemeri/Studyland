using System.ComponentModel.DataAnnotations;

namespace Dtos.Accounts;

public class LoginRequestDto
{
    [Required]
    public string Email { get; set; } = "";
    [Required]
    public string Password { get; set; } = "";
}