namespace Domain;

public class Topic
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required string Title { get; set; }
    public List<Session> Sessions { get; set; } = [];
}