using System.ComponentModel.DataAnnotations;

namespace Dtos.Accounts;

public class RegisterRequestDto
{
    [Required]
    public string DisplayName { get; set; } = "";
    [Required]
    public string Email { get; set; } = "";
    [Required]
    public string Password { get; set; } = "";
}
