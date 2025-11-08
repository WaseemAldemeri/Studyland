// src/components/stats/BreakdownChart.tsx

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { type StatsDto, type UserDto } from "@/api/generated";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMemo } from "react";

interface BreakdownChartProps {
  userTopicBreakdowns: StatsDto["usersTopicBreakDowns"];
  // We need a list of all users being queried to populate the dropdown
  usersInQuery: UserDto[];
  isLoading: boolean;
  // We need the current user's ID to select them by default
  currentUserId: string;
}

// Color palette for the pie chart segments
const TOPIC_COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
];

export function BreakdownChart({
  userTopicBreakdowns,
  usersInQuery,
  isLoading,
  currentUserId,
}: BreakdownChartProps) {
  // State to manage which user is selected in the dropdown
  const [selectedUserId, setSelectedUserId] = useState(currentUserId);

  // useMemo to find the data for the selected user.
  // This will only re-calculate when the breakdowns or selected user changes.
  const chartData = useMemo(() => {
    const userData = userTopicBreakdowns?.filter(
      (utb) => utb.user.id === selectedUserId
    );

    if (!userData) return [];

    return userData.map((tb) => ({
      name: tb.topic.title,
      value: tb.totalStudyTimeHours,
    }));
  }, [userTopicBreakdowns, selectedUserId]);

  if (isLoading) {
    return (
      <Card className="h-96">
        <CardHeader>
          <CardTitle>Topic Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-full text-muted-foreground">
          Loading chart data...
        </CardContent>
      </Card>
    );
  }

  if (!isLoading && userTopicBreakdowns.length === 0) {
    return (
      <Card className="h-96">
        <CardHeader>
          <CardTitle>Topic Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-full text-muted-foreground">
          No Data
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-96">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Topic Breakdown</CardTitle>
          {/* Dropdown to switch between users */}
          <Select value={selectedUserId} onValueChange={setSelectedUserId}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select user..." />
            </SelectTrigger>
            <SelectContent>
              {usersInQuery.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              innerRadius={60} // This makes it a donut chart
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={TOPIC_COLORS[index % TOPIC_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => `${value.toFixed(1)} hours`}
            />
            <Legend iconSize={10} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
