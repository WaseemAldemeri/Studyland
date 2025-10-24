namespace Models;

public class Award
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public required string Title { get; set; }    
    public DateTimeOffset Date { get; set; }
    public TimeSpan TotalDurationMS { get; set; }

    public required string UserId { get; set; }
    public User? User { get; set; }
}