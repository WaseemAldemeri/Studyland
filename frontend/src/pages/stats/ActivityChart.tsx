// src/components/stats/ActivityChart.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  type MouseHandlerDataParam,
} from "recharts";
import { type StatsDto } from "@/api/generated";
import { useMemo } from "react";

// Define a type for the transformed data that the chart will use
type ChartDataPoint = {
  date: string; // The x-axis label (e.g., "Oct 28")
  [key: string]: string | number; // Each user will be a key, e.g., "Waseem": 5.5
};

interface ActivityChartProps {
  // We'll receive the raw daily activities from the parent
  dailyActivities: StatsDto["dailyActivities"];
  isLoading: boolean;
  onDayClick: (date: string) => void;
}

// A simple color palette for the users in the chart
const USER_COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088FE"];

// Helper to format TimeSpan string to hours
const timeSpanToHours = (timeSpan: string): number => {
  const parts = timeSpan.split(/[:.]/);
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  const seconds = parseInt(parts[2], 10);
  return hours + minutes / 60 + seconds / 3600;
};

export function ActivityChart({
  dailyActivities,
  isLoading,
  onDayClick,
}: ActivityChartProps) {
  // useMemo is a React hook that memoizes the result of a calculation.
  // This transformation will only re-run if 'dailyActivities' changes.
  const { chartData, userNames } = useMemo(() => {
    if (!dailyActivities || dailyActivities.length === 0) {
      return { chartData: [], userNames: [] };
    }

    // Get a unique list of all user display names present in the data
    const users = [
      ...new Set(dailyActivities.map((da) => da.user.displayName)),
    ];

    // Transform the flat data into a grouped structure for the chart
    const groupedData: { [date: string]: ChartDataPoint } = {};

    dailyActivities.forEach((activity) => {
      const dateLabel = new Date(activity.date).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });

      if (!groupedData[dateLabel]) {
        groupedData[dateLabel] = { date: dateLabel };
      }

      groupedData[dateLabel][activity.user.displayName] = timeSpanToHours(
        activity.totalDuration
      );
    });

    return { chartData: Object.values(groupedData), userNames: users };
  }, [dailyActivities]);

  const handleChartClick = (payload: MouseHandlerDataParam) => {
    // The payload contains information about the clicked bar.
    // 'activeLabel' holds the x-axis value (our formatted date string).
    if (payload && payload.activeLabel) {
      onDayClick(payload.activeLabel);
    }
  };

  if (isLoading) {
    return (
      <Card className="lg:col-span-2 h-96">
        <CardHeader>
          <CardTitle>Study Activity Over Time</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-full text-muted-foreground">
          Loading chart data...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="lg:col-span-2 h-96">
      <CardHeader>
        <CardTitle>Study Activity Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        {/* ResponsiveContainer makes the chart fill its parent container */}
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
            onClick={handleChartClick}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} />
            <YAxis unit="h" tickLine={false} axisLine={false} />
            <Tooltip
              cursor={{ fill: "grey" }}
              contentStyle={{
                backgroundColor: "white",
                borderColor: "hsl(var(--border))",
                borderRadius: "10px",
              }}
              formatter={(value: number) => `${value.toFixed(2)}h`}
            />
            <Legend />
            {/* We map over the unique user names to create a stacked bar for each */}
            {userNames.map((userName, index) => (
              <Bar
                key={userName}
                dataKey={userName}
                stackId="a" // All bars with the same stackId will be stacked
                fill={USER_COLORS[index % USER_COLORS.length]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
