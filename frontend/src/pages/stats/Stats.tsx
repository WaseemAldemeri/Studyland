// src/pages/StatsPage.tsx

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

// Import your generated services and DTO types
// Make sure the paths are correct for your project structure
import { StatsService, TopicsService, UsersService } from "@/api/generated";
import { FilterBar } from "./FilterBar";
import { Clock, TrendingUp, CalendarDays, BookHeart } from "lucide-react";
import { StatCard } from "./StatCard";
import { ActivityChart } from "./ActivityChart";
import { BreakdownChart } from "./BreakDownChart";
import { SessionsDataTable } from "./SessionsDataTable";

// Helper function to get the default date range for the last 7 days
const getDefaultDateRange = () => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 360);
  return { startDate, endDate };
};

const CURRENT_USER_ID = "223e568c-6e55-4561-a59e-83085a5c6d21";

// --- Helper function to format TimeSpan strings ---
function formatTimeSpan(timeSpanString: string): string {
  const parts = timeSpanString.split(/[:.]/);
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);

  if (hours === 0 && minutes === 0) return "0 min";
  if (hours === 0) return `${minutes} min`;

  const totalHours = hours + minutes / 60;
  return `${totalHours.toFixed(1)} h`;
}

export default function StatsPage() {
  // --- STATE MANAGEMENT FOR FILTERS ---
  // This is the single source of truth for all filters on this page.
  const [dateRange, setDateRange] = useState(getDefaultDateRange());
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>(dateRange.endDate.toLocaleString());

  const handleDaySelect = (date: string) => {
    setSelectedDay(date);
  };

  // --- DEPENDENT DATA FETCHING ---

  // Query 1: Fetch all available topics for the multi-select filter.
  // This data is then passed as a prop to the FilterBar component.
  const { data: allTopics, isLoading: topicsLoading } = useQuery({
    queryKey: ["allTopics"],
    queryFn: () => TopicsService.getTopics(),
  });

  // Query 2: Fetch all available users (friends) for the comparison multi-select.
  const { data: allUsers, isLoading: usersLoading } = useQuery({
    queryKey: ["allUsers"],
    queryFn: () => UsersService.getUsers(), // Assuming you have a GET /api/users endpoint
  });

  // --- MAIN DATA FETCHING ---

  // Query 3: The main stats query.
  // This query's key includes all filter states, so it automatically refetches
  // when any filter is changed by the user.
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["statsData", dateRange, selectedTopicIds, selectedUserIds],
    queryFn: () => {
      // We pass an empty array for topics/users if none are selected,
      // which the backend will interpret as "include all".
      const topicIds = selectedTopicIds.length > 0 ? selectedTopicIds : [];
      const userIds = selectedUserIds.length > 0 ? selectedUserIds : [];

      return StatsService.getDashboardStats(
        userIds,
        dateRange.startDate.toISOString(),
        dateRange.endDate.toISOString(),
        topicIds
      );
    },
    // Keep the data from the previous fetch visible while the new data is loading.
    // This prevents the UI from flickering.
  });

  const myKpis = stats?.usersKpis.find((uk) => uk.user.id === CURRENT_USER_ID);

  // Define the data for our KPI cards in an array to keep the JSX clean
  const kpiCardData = [
    {
      title: "Total Hours Studied",
      value: myKpis ? formatTimeSpan(myKpis.totalStudyTime) : "...",
      icon: Clock,
    },
    {
      title: "Average Session",
      value: myKpis ? formatTimeSpan(myKpis.averegeSessionDuration) : "...",
      icon: TrendingUp,
    },
    {
      title: "Days Studied",
      value: myKpis ? `${myKpis.daysStudied} / ${stats?.totalDays}` : "...",
      icon: CalendarDays,
    },
  ];

  const usersInQuery = useMemo(() => {
    if (!stats?.usersKpis) return [];
    // We can get the UserDto from the userKpis array
    return stats.usersKpis.map((uk) => uk.user);
  }, [stats]);

  const handleDateChange = (newDates: { startDate?: Date; endDate?: Date }) => {
    setDateRange((prev) => ({
      startDate: newDates.startDate ?? prev.startDate,
      endDate: newDates.endDate ?? prev.endDate,
    }));
  };

  // --- UI & RENDER ---

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8">
      {/* --- Section 1: Page Header and Filters --- */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">
          Statistics Dashboard
        </h1>

        {/*
          This is where the FilterBar component will go.
          It will receive props like:
          - allTopics={allTopics}
          - selectedTopicIds={selectedTopicIds}
          - onTopicsChange={setSelectedTopicIds}
          - ... and so on for dates and users.
        */}
        <FilterBar
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
          onDateChange={handleDateChange}
          allTopics={allTopics ?? []}
          selectedTopicIds={selectedTopicIds}
          onTopicsChange={setSelectedTopicIds}
          allUsers={allUsers ?? []}
          selectedUserIds={selectedUserIds}
          onUsersChange={setSelectedUserIds}
        />
      </div>

      {/* --- Section 2: KPI Cards Row --- */}
      {/* We can show a loading skeleton or a message while the main stats are loading */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpiCardData.map((kpi) => (
          <StatCard
            key={kpi.title}
            title={kpi.title}
            value={kpi.value}
            icon={kpi.icon}
            isLoading={statsLoading} // Pass the loading state to each card
          />
        ))}
      </div>

      {/* Other placeholder sections remain the same */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 2. Replace the placeholder div with the ActivityChart component */}
        <ActivityChart
          dailyActivities={stats?.dailyActivities ?? []}
          isLoading={statsLoading}
          onDayClick={handleDaySelect}
        />

        {/* Pie Chart placeholder remains for now */}

        <BreakdownChart
          userTopicBreakdowns={stats?.usersTopicBreakDowns ?? []}
          usersInQuery={usersInQuery}
          isLoading={statsLoading}
          currentUserId={CURRENT_USER_ID} // Pass the hardcoded current user ID
        />
      </div>
      <SessionsDataTable selectedDay={selectedDay} />
    </div>
  );
}
