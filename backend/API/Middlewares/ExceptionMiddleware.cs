using Application.Core;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace API.Middlewares;


public class ExceptionMiddleware(ILogger<ExceptionMiddleware> logger, IHostEnvironment env) : IMiddleware
{
    public async Task InvokeAsync(HttpContext context, RequestDelegate next)
    {
        try
        {
            await next(context);
        }
        catch (RestException ex)
        {
            await HandleRestException(context, ex);
        }
        catch (ValidationException ex)
        {
            await HandleValidationException(context, ex);
        }
        catch (Exception ex)
        {
            await HandleUncaughtException(context, ex);
        }
    }


    private async Task HandleUncaughtException(HttpContext context, Exception ex)
    {
        var exception = RestException.Internal(ex.Message, env.IsDevelopment() ? ex.StackTrace : null);
        await HandleRestException(context, exception);
    }


    private static async Task HandleRestException(HttpContext context, RestException ex)
    {
        context.Response.StatusCode = (int)ex.Code;
        await context.Response.WriteAsJsonAsync(ex.AsResponse);
    }


    private static async Task HandleValidationException(HttpContext context, ValidationException ex)
    {
        var validationErrors = new Dictionary<string, string[]>();
        if (ex.Errors is not null)
        {
            foreach (var error in ex.Errors)
            {
                if (validationErrors.TryGetValue(error.PropertyName, out var existingErrors))
                {
                    validationErrors[error.PropertyName] = [.. existingErrors, error.ErrorMessage];
                }
                else
                {
                    validationErrors[error.PropertyName] = [error.ErrorMessage];
                }
            }
        }

        var validationProblemDetails = new ValidationProblemDetails(validationErrors)
        {
            Status = StatusCodes.Status400BadRequest,
            Type = "ValidationFailure",
            Title = "Validation Error",
            Detail = "One or more validation errors has occurred"
        };

        context.Response.StatusCode = StatusCodes.Status400BadRequest;

        await context.Response.WriteAsJsonAsync(validationProblemDetails);
    }
}