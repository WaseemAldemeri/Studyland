// src/data/mockData.ts

// This represents the data we will eventually get from SignalR

export const mockLiveSessions = [
  {
    userId: "1",
    displayName: "Sarah",
    avatarUrl: "https://api.dicebear.com/7.x/lorelei/svg?seed=Sarah",
    topic: "Quantum Physics",
    // We'll store the start time to calculate the live duration
    sessionStartTime: new Date(Date.now() - 3600 * 1000 * 1.5), // 1.5 hours ago
  },
  {
    userId: "2",
    displayName: "Omar",
    avatarUrl: "https://api.dicebear.com/7.x/lorelei/svg?seed=Omar",
    topic: "React Query Best Practices",
    sessionStartTime: new Date(Date.now() - 3600 * 1000 * 0.5), // 30 minutes ago
  },
];

// This represents the list of topics the user can choose from
export const mockTopics = [
  { id: "43c22f5e-9db7-422d-8c06-251310cd984c", title: "Advanced .NET" },
  { id: "a1b2c3d4-...", title: "Frontend Architecture" },
  { id: "e5f6g7h8-...", title: "Database Optimization" },
];

// src/data/mockData.ts

// ... (add this to your existing mockData.ts file)

export const mockChatMessages = [
  {
    id: "msg1",
    type: "system",
    text: "Welcome to the Studyland community hub!",
    timestamp: new Date(Date.now() - 3600 * 1000 * 2), // 2 hours ago
  },
  {
    id: "msg2",
    type: "user",
    userId: "1",
    displayName: "Sarah",
    avatarUrl: "https://api.dicebear.com/7.x/lorelei/svg?seed=Sarah",
    text: "Just starting my session on Quantum Physics. Wish me luck!",
    timestamp: new Date(Date.now() - 3600 * 1000 * 1.5), // 1.5 hours ago
  },
  {
    id: "msg3",
    type: "system",
    text: 'Waseem has started studying "Advanced .NET".',
    timestamp: new Date(Date.now() - 3600 * 1000 * 1), // 1 hour ago
  },
  {
    id: "msg4",
    type: "user",
    userId: "2",
    displayName: "Omar",
    avatarUrl: "https://api.dicebear.com/7.x/lorelei/svg?seed=Omar",
    text: "Anyone have good resources on React Query v5?",
    timestamp: new Date(Date.now() - 3600 * 1000 * 0.6), // ~35 minutes ago
  },
  {
    id: "msg5",
    type: "user",
    userId: "3", // Assuming '3' is the current user for styling
    displayName: "Waseem",
    avatarUrl: "https://api.dicebear.com/7.x/lorelei/svg?seed=Waseem",
    text: "I'm using the auto-generated client, it's amazing!",
    timestamp: new Date(Date.now() - 3600 * 1000 * 0.1), // ~5 minutes ago
  },
];

// src/data/mockData.ts

// ... (add this to your existing mockData.ts file)

export const mockDailyGoal = {
  goalHours: 5,
  completedHours: 3.5,
};

export const mockTodaySessions = [
  { id: "s1", topic: "Advanced .NET Architecture", duration: "1h 30m" },
  { id: "s2", topic: "React Query Data Fetching", duration: "45m" },
  { id: "s3", topic: "Tailwind CSS Layouts", duration: "1h 15m" },
];

export const mockDailyLeaderboard = [
  { rank: 1, displayName: "Sarah", avatarUrl: "https://api.dicebear.com/7.x/lorelei/svg?seed=Sarah", hoursToday: 4.5 },
  { rank: 2, displayName: "Waseem", avatarUrl: "https://api.dicebear.com/7.x/lorelei/svg?seed=Waseem", hoursToday: 3.5 },
  { rank: 3, displayName: "Omar", avatarUrl: "https://api.dicebear.com/7.x/lorelei/svg?seed=Omar", hoursToday: 3.2 },
];