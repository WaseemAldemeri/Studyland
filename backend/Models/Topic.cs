namespace Models;

public class Topic
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public required string Title { get; set; }
    public List<Session> Sessions { get; set; } = [];
}