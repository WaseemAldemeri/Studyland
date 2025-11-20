using System.ComponentModel.DataAnnotations;

namespace Dtos.Chat;


public class GetChatMessagesDto
{
    [Required]
    public Guid ChannelId { get; set; }
    public DateTimeOffset? Cursor { get; set; }
    public int PageSize { get; set; }
}