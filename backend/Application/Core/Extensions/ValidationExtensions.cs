using Domain;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace Application.Core.Extensions;

public static class ValidationExtensions
{
    /// <summary>
    /// This method extends fluent validation with a method that
    /// combines NotEpmty and WithMessage with a pre formated message.
    /// </summary>
    public static IRuleBuilderOptions<T, TProperty> Required<T, TProperty>(
        this IRuleBuilder<T, TProperty> ruleBuilder
    ) => ruleBuilder.NotEmpty().WithMessage("'{PropertyName}' is Required");



    /// <summary>
    /// This methods extends fluent validation with a method that
    /// uses MustAsync to make a call on database with the resource id
    /// and throws a pre formated message. Works only on Guid TPropertiy
    /// </summary>
    /// <param name="dbSet">The database Context set to the domain entity</param>
    public static IRuleBuilderOptions<T, Guid> MustExistInDb<T, TDomainEntity>(
        this IRuleBuilder<T, Guid> ruleBuilder,
        DbSet<TDomainEntity> dbSet
    ) where TDomainEntity : class, IDomainEntity
    {
        var resourceName = typeof(TDomainEntity).Name;

        return ruleBuilder.MustAsync(async (id, cancellationToken) =>
            await dbSet.AnyAsync(e => e.Id.Equals(id), cancellationToken)
        )
        .WithMessage($"Could not find the specified '{resourceName}' with the provided Id: '{{PropertyValue}}'");

    }

    /// <inheritdoc cref="MustExistInDb{T, TDomainEntity}(IRuleBuilder{T, Guid}, DbSet{TDomainEntity})"/>
    public static IRuleBuilderOptions<T, Guid?> MustExistInDb<T, TDomainEntity>(
        this IRuleBuilder<T, Guid?> ruleBuilder,
        DbSet<TDomainEntity> dbSet
    ) where TDomainEntity : class, IDomainEntity
    {
        var resourceName = typeof(TDomainEntity).Name;

        return ruleBuilder.MustAsync(async (id, cancellationToken) =>
        {
            if (id is null)
            {
                return true;
            }

            return await dbSet.AnyAsync(e => e.Id.Equals(id), cancellationToken);
        })
        .WithMessage($"Could not find the specified '{resourceName}' with the provided Id: '{{PropertyValue}}'");
    }
}