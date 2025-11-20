namespace Dtos;


public class PagedList<T, TCursor>
{
    public required List<T> Items { get; set; }
    public TCursor? NextCursor { get; set; }
}