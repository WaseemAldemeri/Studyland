namespace OldModels;

// These classes are temporary containers for the raw data from SQLite.
// Dapper will automatically map the database columns to these properties.

public class OldUser
{
    public string id { get; set; } // Discord ID
    public long date { get; set; } // Unix timestamp in milliseconds
}

public class OldSession
{
    public string user_id { get; set; }
    public long date { get; set; }
    public long duration { get; set; } // Duration in seconds
    public long topic_id { get; set; }
}

public class OldTopic
{
    public long id { get; set; }
    public string name { get; set; }
}

public class OldAward
{
    public string user_id { get; set; }
    public long date { get; set; }
    public long duration { get; set; }
}