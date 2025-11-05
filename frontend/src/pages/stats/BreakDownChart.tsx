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
  userTopicBreakdowns: StatsDto['usersTopicBreakDowns'];
  // We need a list of all users being queried to populate the dropdown
  usersInQuery: UserDto[];
  isLoading: boolean;
  // We need the current user's ID to select them by default
  currentUserId: string;
}

// Color palette for the pie chart segments
const TOPIC_COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

// Helper to format TimeSpan string for the tooltip and label
const timeSpanToHours = (timeSpan: string): number => {
    const parts = timeSpan.split(/[:.]/);
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    return hours + minutes / 60;
};

export function BreakdownChart({ 
    userTopicBreakdowns, 
    usersInQuery,
    isLoading,
    currentUserId 
}: BreakdownChartProps) {
  // State to manage which user is selected in the dropdown
  const [selectedUserId, setSelectedUserId] = useState(currentUserId);

  // useMemo to find the data for the selected user.
  // This will only re-calculate when the breakdowns or selected user changes.
  const chartData = useMemo(() => {
    const userData = userTopicBreakdowns?.filter(utb => utb.user.id === selectedUserId);
    
    if (!userData) return [];
    
    return userData.map(tb => ({
      name: tb.topic.title,
      value: timeSpanToHours(tb.totalStudyTime),
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
              {usersInQuery.map(user => (
                <SelectItem key={user.id} value={user.id}>{user.displayName}</SelectItem>
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
              // A custom label that shows percentage on the chart
              label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                return (percent * 100) > 5 ? (
                  <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12}>
                    {`${(percent * 100).toFixed(0)}%`}
                  </text>
                ) : null;
              }}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={TOPIC_COLORS[index % TOPIC_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => `${value.toFixed(1)} hours`} />
            <Legend iconSize={10} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}