namespace Dtos.Users;

public class UserDailyGoalDto
{
    public required UserDto User {get;set;}
    public required long DailyGoalMs { get; set; } 
    public required long TotalStudiedMs { get; set; }
    public float PercentageCompleted => 
        DailyGoalMs == 0 ? 0 : (float)TotalStudiedMs / DailyGoalMs * 100;
}

