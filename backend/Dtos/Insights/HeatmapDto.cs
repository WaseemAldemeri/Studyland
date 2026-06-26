namespace Dtos.Insights;

public class HeatmapDto
{
    public required DateOnly StartDate { get; set; }
    public required DateOnly EndDate { get; set; }
    public required double TotalHours { get; set; }
    public required int ActiveDays { get; set; }
    public required List<HeatmapDay> Days { get; set; }

    public class HeatmapDay
    {
        public required DateOnly Date { get; set; }
        public required double Hours { get; set; }
        public required int Sessions { get; set; }
    }
}
