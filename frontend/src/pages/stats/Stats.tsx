// src/pages/StatsPage.tsx

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

// Import your generated services and DTO types
// Make sure the paths are correct for your project structure
import { StatsService, TopicsService, UsersService } from "@/api/generated";

// Helper function to get the default date range for the last 7 days
const getDefaultDateRange = () => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 6);
  // Set time to the beginning of the start day and end of the end day for a full range
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);
  return { startDate, endDate };
};

export default function StatsPage() {
  // --- STATE MANAGEMENT FOR FILTERS ---
  // This is the single source of truth for all filters on this page.
  const [dateRange, setDateRange] = useState(getDefaultDateRange());
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // --- DEPENDENT DATA FETCHING ---

  // Query 1: Fetch all available topics for the multi-select filter.
  // This data is then passed as a prop to the FilterBar component.
  const { data: allTopics, isLoading: topicsLoading } = useQuery({
    queryKey: ['allTopics'],
    queryFn: () => TopicsService.getTopics(),
  });

  // Query 2: Fetch all available users (friends) for the comparison multi-select.
  const { data: allUsers, isLoading: usersLoading } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => UsersService.getUsers(), // Assuming you have a GET /api/users endpoint
  });


  // --- MAIN DATA FETCHING ---

  // Query 3: The main stats query.
  // This query's key includes all filter states, so it automatically refetches
  // when any filter is changed by the user.
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['statsData', dateRange, selectedTopicIds, selectedUserIds],
    queryFn: () => {
      // We pass an empty array for topics/users if none are selected,
      // which the backend will interpret as "include all".
      const topicIds = selectedTopicIds.length > 0 ? selectedTopicIds : [];
      const userIds = selectedUserIds.length > 0 ? selectedUserIds : [];
      
      return StatsService.getDashboardStats({
        StartDate: dateRange.startDate.toISOString(),
        EndDate: dateRange.endDate.toISOString(),
        TopicIds: topicIds,
        UserIds: userIds,
      });
    },
    // Keep the data from the previous fetch visible while the new data is loading.
    // This prevents the UI from flickering.
    keepPreviousData: true,
  });


  // --- UI & RENDER ---

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8">
      
      {/* --- Section 1: Page Header and Filters --- */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Statistics Dashboard</h1>
        
        {/*
          This is where the FilterBar component will go.
          It will receive props like:
          - allTopics={allTopics}
          - selectedTopicIds={selectedTopicIds}
          - onTopicsChange={setSelectedTopicIds}
          - ... and so on for dates and users.
        */}
        <div className="bg-secondary/50 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-primary mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <div className="h-10 bg-background/50 rounded-md p-2 flex items-center text-foreground/50">
                Placeholder for Date Input
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <div className="h-10 bg-background/50 rounded-md p-2 flex items-center text-foreground/50">
                Placeholder for Date Input
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Topics</label>
              <div className="h-10 bg-background/50 rounded-md p-2 flex items-center text-foreground/50">
                Placeholder for Topic Multi-select
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Compare With</label>
              <div className="h-10 bg-background/50 rounded-md p-2 flex items-center text-foreground/50">
                Placeholder for Friends Multi-select
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Section 2: KPI Cards Row --- */}
      {/* We can show a loading skeleton or a message while the main stats are loading */}
      {statsLoading ? (
        <div>Loading KPIs...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {['Total Hours', 'Avg Session Len', 'Days Studied', 'Top Topic'].map((title) => (
            <div key={title} className="h-32 bg-secondary/50 rounded-lg p-4">
              <h3 className="text-md font-semibold text-primary">{title}</h3>
              <div className="text-4xl font-bold mt-4 text-foreground/20">
                {/* We would now get this from stats.kpis */}
                ...
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Other placeholder sections remain the same */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ... Chart Placeholders ... */}
      </div>
      <div className="min-h-[500px] bg-secondary/50 rounded-lg p-4">
        {/* ... Data Table Placeholder ... */}
      </div>

    </div>
  );
}