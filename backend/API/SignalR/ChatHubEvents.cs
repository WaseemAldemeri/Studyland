namespace API.SignalR;

public static class ChatHubEvents
{
    /// <summary>
    /// Have a paylod of ChatMessageDto.
    /// Client should append the new message to the chat.
    /// </summary>
    public const string ReceiveMessage = "ReceiveMessage";
    /// <summary>
    /// Have a paylod of List<UserPressenceDto>.
    /// Client should render the pressence list 
    /// </summary>
    public const string RecievePressenceList = "RecievePressenceList";
    /// <summary>
    /// Have a paylod of UserPressenceDto.
    /// Client should update the specified user status and announce in the chat / notify.
    /// </summary>
    public const string UserStartedStudying = "UserStartedStudying";
    /// <summary>
    /// Have a paylod of UserPressenceDto.
    /// Client should update the specified user status and announce in the chat / notify.
    /// </summary>
    public const string UserStoppedStudying = "UserStoppedStudying";
    /// <summary>
    /// Have a paylod of UserPressenceDto.
    /// Client should update the specified user status and announce in the chat / notify.
    /// </summary>
    public const string UserJoinedChannel = "UserJoinedChannel";
    /// <summary>
    /// Have a paylod of UserPressenceDto.
    /// Client should update the specified user status and announce in the chat / notify.
    /// </summary>
    public const string UserLeftChannel = "UserLeftChannel";
}