using Dapper;
using Persistence;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Domain;
using OldModels;

Console.WriteLine("Starting data migration");

const string newConnectionString = "Data Source=../API/studyland.db";
const string oldConnectionString = "Data Source=./nerds.db";

var optionsBuilder = new DbContextOptionsBuilder();
optionsBuilder.UseSqlite(newConnectionString);
var newDbContext = new AppDbContext(optionsBuilder.Options);

Console.WriteLine("Step 1: Preparing destination database (studyland.db)...");
await newDbContext.Database.MigrateAsync();

Console.WriteLine("\nStep 2: Reading all data from source database (nerds.db)...");
await using var sqliteConnection = new SqliteConnection(oldConnectionString);

// Dapper's QueryAsync executes raw SQL and maps results to our OldModel classes.
var oldUsers = (await sqliteConnection.QueryAsync<OldUser>("SELECT * FROM users")).ToList();

var oldSessions = new List<OldSession>();
var rawData = await sqliteConnection.QueryAsync("SELECT * FROM sessions");
foreach (var row in rawData)
{
    // We are now manually creating the object.
    // The error will happen on the 'duration' line if the types are truly mismatched.
    if (row.duration is null)
    {
        continue;
    }
    var session = new OldSession
    {
        user_id = row.user_id,
        date = row.date,
        duration = (long)row.duration, // <-- The cast from dynamic to long
        topic_id = row.topic_id
    };
    oldSessions.Add(session);
}

var oldAwards = new List<OldAward>();
var rawDataAwards = await sqliteConnection.QueryAsync("SELECT * FROM awards");
foreach (var row in rawDataAwards)
{
    // We are now manually creating the object.
    // The error will happen on the 'duration' line if the types are truly mismatched.
    if (row.duration is null)
    {
        continue;
    }
    var award = new OldAward
    {
        user_id = row.user_id,
        date = row.date,
        duration = (long)row.duration, // <-- The cast from dynamic to long
    };
    oldAwards.Add(award);
}

Console.WriteLine("Successfully read raw data and manually mapped it.");
// var oldSessions = (await sqliteConnection.QueryAsync<OldSession>("SELECT * FROM sessions")).ToList();
// var oldAwards = (await sqliteConnection.QueryAsync<OldAward>("SELECT * FROM awards")).ToList();
var oldTopics = (await sqliteConnection.QueryAsync<OldTopic>("SELECT * FROM topics")).Select(t => t.name == "all" ? new OldTopic() { id = t.id, name = t.name } : t).ToList();

Console.WriteLine($"Found: {oldUsers.Count} users, {oldSessions.Count} sessions, {oldTopics.Count} topics, {oldAwards.Count} awards.");


if (await newDbContext.Users.AnyAsync())
{
    Console.WriteLine("\nDestination database is not empty. Aborting migration.");
    return;
}


Console.WriteLine("\nStep 3: Transforming and seeding data...");


var newUsers = oldUsers.Select(user => new User()
{
    DiscordId = user.id,
    DisplayName = $"user_{user.id}", // Better temp name
    DateJoined = DateTimeOffset.FromUnixTimeMilliseconds(user.date)
}).ToList();



var newTopics = oldTopics.Select(topic =>
    new Topic() { Title = topic.name }).ToList();


var newSessions = oldSessions.Select(session =>
{
    var corrospondingUser = newUsers.FirstOrDefault(u => u.DiscordId == session.user_id);
    if (corrospondingUser is null)
    {
        throw new NullReferenceException($"Coulddn't find a user with a discord id {session.user_id}");
    }

    var oldTopic = oldTopics.FirstOrDefault(t => t.id == session.topic_id)?.name;
    if (oldTopic is null)
    {
        throw new NullReferenceException("Error finding topic for session");
    }

    var corrospondingTopic = newTopics.FirstOrDefault(t => t.Title == oldTopic);
    if (corrospondingTopic is null)
    {
        throw new NullReferenceException("Error finding topic for session");
    }

    return new Session()
    {
        StartedAt = DateTimeOffset.FromUnixTimeMilliseconds(session.date),
        // make sure that i stored in seconds in discord bot script
        DurationMS = TimeSpan.FromSeconds(session.duration),
        TopicId = corrospondingTopic.Id,
        UserId = corrospondingUser.Id,
    };
}).ToList();


var newAwards = oldAwards.Skip(1).Select(award =>
{
    var corrospondingUser = newUsers.FirstOrDefault(u => u.DiscordId == award.user_id)
    ?? throw new NullReferenceException("coudnt find user for awards");


    return new Award()
    {
        Title = "Nerd Of The Month",
        UserId = corrospondingUser.Id,
        Date = DateTimeOffset.FromUnixTimeMilliseconds(award.date),
        TotalDurationMS = TimeSpan.FromSeconds(award.duration),
    };
}).ToList();


await newDbContext.Users.AddRangeAsync(newUsers);
await newDbContext.Topics.AddRangeAsync(newTopics);
await newDbContext.Sessions.AddRangeAsync(newSessions);
await newDbContext.Awards.AddRangeAsync(newAwards);

await newDbContext.SaveChangesAsync();

Console.WriteLine("saved all data");