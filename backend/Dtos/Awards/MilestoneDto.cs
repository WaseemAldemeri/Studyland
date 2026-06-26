namespace Dtos.Awards;

public class MilestoneDto
{
    public required string Key { get; set; }
    public required string Title { get; set; }
    public required string Description { get; set; }
    public required string Category { get; set; }
    public required string Icon { get; set; }
    public required double Threshold { get; set; }
    public required double CurrentValue { get; set; }
    public required bool Earned { get; set; }
    public DateOnly? EarnedDate { get; set; }
    public required double ProgressPercent { get; set; }
}
