using System.Net;

namespace Application.Core;


public class RestException(HttpStatusCode code, string message, string? details = null) : Exception(message)
{
    public HttpStatusCode Code { get; set; } = code;

    public string? Details { get; set; } = details;

    /// <summary>
    /// The error data represented as an object ready for json parsing
    /// </summary>
    public record ExceptionResponse(HttpStatusCode Status, string Message, string? Details);

    /// <summary>
    /// Returns the error as an object ready for json serilization
    /// </summary>
    public ExceptionResponse AsResponse => new(Code, Message, Details);

    /// <summary>
    /// Creates a 404 Not Found exception.
    /// </summary>
    public static RestException NotFound(string message = "Resource not found.")
    {
        return new RestException(HttpStatusCode.NotFound, message);
    }

    /// <summary>
    /// Creates a 400 Bad Request exception.
    /// </summary>
    public static RestException BadRequest(string message = "Bad request.")
    {
        return new RestException(HttpStatusCode.BadRequest, message);
    }

    /// <summary>
    /// Creates a 401 Unauthorized exception (not authenticated).
    /// </summary>
    public static RestException Unauthorized(string message = "Not authorized.")
    {
        return new RestException(HttpStatusCode.Unauthorized, message);
    }

    /// <summary>
    /// Creates a 403 Forbidden exception (authenticated, but not permitted).
    /// </summary>
    public static RestException Forbidden(string message = "Access to this resource is forbidden.")
    {
        return new RestException(HttpStatusCode.Forbidden, message);
    }

    /// <summary>
    /// Creates a 409 Conflict exception (e.g., duplicate email).
    /// </summary>
    public static RestException Conflict(string message = "A conflict occurred.")
    {
        return new RestException(HttpStatusCode.Conflict, message);
    }

    /// <summary>
    /// Creates a 500 Internal Server exception.
    /// </summary>
    public static RestException Internal(string message = "Internal Server Error", string? details = null)
    {
        return new RestException(HttpStatusCode.InternalServerError, message, details);
    }

}