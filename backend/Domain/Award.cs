namespace Domain;

public class Award
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public required string Title { get; set; }    
    public required DateTimeOffset Date { get; set; }
    public required TimeSpan TotalDurationMS { get; set; }

    public required string UserId { get; set; }
    public User? User { get; set; }
}