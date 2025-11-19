using Domain;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Persistence;

public class AppDbContext(DbContextOptions options)
    : IdentityDbContext<User, IdentityRole<Guid>, Guid>(options)
{
    public DbSet<Session> Sessions { get; set; }
    public DbSet<Topic> Topics { get; set; }
    public DbSet<Award> Awards { get; set; }
    public DbSet<Guild> Guilds { get; set; }
    public DbSet<ChatChannel> ChatChannels { get; set; }
    public DbSet<ChatMessage> ChatMessages { get; set; }


    // this to make timespan save correctly in sql db
    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // This creates ONE composite index that covers both columns in the correct order
        builder.Entity<Session>()
            .HasIndex(s => new { s.UserId, s.StartedAt });

        builder.Entity<ChatMessage>()
            .HasIndex(cm => new { cm.ChannelId, cm.Timestamp });

        builder.Entity<User>()
            .HasIndex(u => new { u.GuildId });

        // This rule tells EF Core how to handle the 'Duration' property for the 'Session' entity.
        builder.Entity<Session>()
            .Property(s => s.Duration)
            .HasConversion<long>(); // <-- This is the magic. Store it as a long (bigint).

        // You must do the same for the Award's duration property.
        builder.Entity<Award>()
            .Property(a => a.TotalDurationMS)
            .HasConversion<long>();
        
        // This was to resolve the "cyclical" thing ef complained about
        // Configure the User -> Guild relationship
        builder.Entity<User>()
            .HasOne(u => u.Guild)
            .WithMany(g => g.Members)
            .HasForeignKey(u => u.GuildId)
            // THIS IS THE CRITICAL LINE:
            // Tell EF Core: "If a Guild is deleted, DO NOT try to automatically
            // delete the users. Just set their GuildId to null, or do nothing."
            .OnDelete(DeleteBehavior.NoAction); // Or .Restrict to prevent deletion if users exist
    }
}
