import { motion } from "framer-motion";
import {
  Hourglass,
  Sun,
  CalendarRange,
  Heart,
  CalendarDays,
  Gauge,
} from "lucide-react";
import type { PersonalRecordsDto } from "@/api/generated";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatHours, formatMinutes, formatDay } from "./format";

interface Props {
  records?: PersonalRecordsDto;
  isLoading: boolean;
}

export function RecordsGrid({ records, isLoading }: Props) {
  if (isLoading || !records) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  const items = [
    {
      icon: Hourglass,
      label: "Longest session",
      value: formatMinutes(records.longestSessionMinutes),
      sub: records.longestSessionTopic
        ? `${records.longestSessionTopic.title} · ${formatDay(
            records.longestSessionDate
          )}`
        : undefined,
    },
    {
      icon: Sun,
      label: "Best day",
      value: formatHours(records.bestDayHours),
      sub: formatDay(records.bestDayDate),
    },
    {
      icon: CalendarRange,
      label: "Best week",
      value: formatHours(records.bestWeekHours),
      sub: records.bestWeekStart
        ? `Week of ${formatDay(records.bestWeekStart, "MMM d")}`
        : undefined,
    },
    {
      icon: Heart,
      label: "Favorite topic",
      value: records.favoriteTopic?.title ?? "—",
      sub: records.favoriteTopic
        ? `${formatHours(records.favoriteTopicHours)} studied`
        : undefined,
    },
    {
      icon: CalendarDays,
      label: "Days studied",
      value: `${records.daysStudied}`,
      sub: records.firstSessionDate
        ? `Since ${formatDay(records.firstSessionDate, "MMM yyyy")}`
        : undefined,
    },
    {
      icon: Gauge,
      label: "Avg. session",
      value: formatMinutes(records.averageSessionMinutes),
      sub: `${records.totalSessions} sessions total`,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.04 }}
        >
          <Card className="h-full">
            <CardContent className="flex flex-col gap-1 p-4 sm:p-5">
              <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">
                <item.icon className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                <span className="truncate">{item.label}</span>
              </div>
              <div className="truncate text-xl font-bold text-primary sm:text-2xl">
                {item.value}
              </div>
              <div className="h-4 text-xs text-muted-foreground">
                {item.sub ?? ""}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
