using Domain;
using Microsoft.EntityFrameworkCore;

namespace Persistence;

public class AppDbContext(DbContextOptions options) : DbContext(options)
{
    public DbSet<User> Users { get; set; }
    public DbSet<Session> Sessions { get; set; }
    public DbSet<Topic> Topics { get; set; }
    public DbSet<Award> Awards { get; set; }
    

    // this to make timespan save correctly in sql db
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // This rule tells EF Core how to handle the 'Duration' property for the 'Session' entity.
        modelBuilder.Entity<Session>()
            .Property(s => s.Duration)
            .HasConversion<long>(); // <-- This is the magic. Store it as a long (bigint).

        // You must do the same for the Award's duration property.
        modelBuilder.Entity<Award>()
            .Property(a => a.TotalDurationMS)
            .HasConversion<long>();
    }
}
