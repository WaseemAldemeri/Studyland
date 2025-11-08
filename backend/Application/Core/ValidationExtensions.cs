using Domain;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Core;


public static class ValidationExtensions
{
    /// <summary>
    /// This method extends fluent validation with a method that
    /// combines NotEpmty and WithMessage with a pre formated message.
    /// </summary>
    /// <param name="fieldName">The field name to display in the error message</param>
    public static IRuleBuilderOptions<T, TProperty> Required<T, TProperty>(
        this IRuleBuilder<T, TProperty> ruleBuilder,
        string fieldName
    ) => ruleBuilder.NotEmpty().WithMessage($"{fieldName} is Required");


    /// <summary>
    /// This methods extends fluent validation with a method that
    /// uses MustAsync to make a call on database with the resource id
    /// and throws a pre formated message. Works only on Guid TPropertiy
    /// </summary>
    /// <typeparam name="TDomainEntity">The Domain Entity to use to query the correct table in the database</typeparam>
    /// <param name="context">The database Context</param>
    /// <param name="resourceName">The entity name to display in the error message</param>
    public static IRuleBuilderOptions<T, Guid> MustExistsInDb<T, TDomainEntity>(
        this IRuleBuilder<T, Guid> ruleBuilder,
        AppDbContext context,
        string resourceName
    ) where TDomainEntity : class, IDomainEntity
    {
        return ruleBuilder.MustAsync(async (id, cancellationToken) =>
            await context.Set<TDomainEntity>().AnyAsync(e => e.Id.Equals(id), cancellationToken)
        )
        .WithMessage($"Could not find the specified {resourceName}");
    }

    /// <summary>
    /// This methods extends fluent validation with a method that
    /// uses MustAsync to make a call on database with the resource id
    /// and throws a pre formated message. Works only on Guid TPropertiy
    /// </summary>
    /// <typeparam name="TDomainEntity">The Domain Entity to use to query the correct table in the database</typeparam>
    /// <param name="context">The database Context</param>
    /// <param name="resourceName">The entity name to display in the error message</param>
    public static IRuleBuilderOptions<T, Guid?> MustExistsInDb<T, TDomainEntity>(
        this IRuleBuilder<T, Guid?> ruleBuilder,
        AppDbContext context,
        string resourceName
    ) where TDomainEntity : class, IDomainEntity
    {
        return ruleBuilder.MustAsync(async (id, cancellationToken) =>
        {

            if (id is null)
            {
                return true;
            }

            return await context.Set<TDomainEntity>().AnyAsync(e => e.Id.Equals(id), cancellationToken);
        })
        .WithMessage($"Could not find the specified {resourceName}");
    }
}