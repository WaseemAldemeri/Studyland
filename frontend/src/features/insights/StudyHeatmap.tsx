import { useMemo } from "react";
import { addDays, format, parseISO, startOfWeek } from "date-fns";
import type { HeatmapDto } from "@/api/generated";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatHours } from "./format";

interface Props {
  data?: HeatmapDto;
  isLoading: boolean;
}

const LEVEL_CLASS = [
  "bg-muted/50",
  "bg-primary/25",
  "bg-primary/45",
  "bg-primary/70",
  "bg-primary",
];

function level(hours: number): number {
  if (hours <= 0) return 0;
  if (hours < 1) return 1;
  if (hours < 2) return 2;
  if (hours < 4) return 3;
  return 4;
}

export function StudyHeatmap({ data, isLoading }: Props) {
  const grid = useMemo(() => {
    if (!data) return null;
    const byDay = new Map(data.days.map((d) => [d.date, d]));
    const start = startOfWeek(parseISO(data.startDate), { weekStartsOn: 1 });
    const end = parseISO(data.endDate);

    const weeks: { date: Date; key: string; hours: number; sessions: number; inRange: boolean }[][] =
      [];
    let cursor = start;
    while (cursor <= end) {
      const days = [];
      for (let i = 0; i < 7; i++) {
        const day = addDays(cursor, i);
        const key = format(day, "yyyy-MM-dd");
        const bucket = byDay.get(key);
        days.push({
          date: day,
          key,
          hours: bucket?.hours ?? 0,
          sessions: bucket?.sessions ?? 0,
          inRange: day >= parseISO(data.startDate) && day <= end,
        });
      }
      weeks.push(days);
      cursor = addDays(cursor, 7);
    }
    return weeks;
  }, [data]);

  if (isLoading || !data || !grid) {
    return <Skeleton className="h-56 w-full rounded-xl" />;
  }

  let lastMonth = -1;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base font-semibold">Study activity</CardTitle>
        <span className="text-sm text-muted-foreground">
          {formatHours(data.totalHours)} over {data.activeDays} days
        </span>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto pb-2">
          <div className="inline-flex flex-col gap-1">
            {/* Month labels */}
            <div className="flex gap-1 pl-8">
              {grid.map((week, wi) => {
                const m = week[0].date.getMonth();
                const showLabel = m !== lastMonth;
                lastMonth = m;
                return (
                  <div key={wi} className="w-3 text-[10px] text-muted-foreground">
                    {showLabel ? format(week[0].date, "MMM") : ""}
                  </div>
                );
              })}
            </div>

            <div className="flex gap-1">
              {/* Weekday labels */}
              <div className="flex w-7 flex-col gap-1 pr-1 text-[10px] text-muted-foreground">
                {["Mon", "", "Wed", "", "Fri", "", ""].map((d, i) => (
                  <div key={i} className="h-3 leading-3">
                    {d}
                  </div>
                ))}
              </div>

              {/* Week columns */}
              {grid.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-1">
                  {week.map((day) =>
                    day.inRange ? (
                      <div
                        key={day.key}
                        title={`${
                          day.hours > 0 ? formatHours(day.hours) : "No study"
                        } · ${format(day.date, "EEE, MMM d yyyy")}`}
                        className={`h-3 w-3 rounded-sm ${LEVEL_CLASS[level(day.hours)]}`}
                      />
                    ) : (
                      <div key={day.key} className="h-3 w-3 rounded-sm bg-transparent" />
                    )
                  )}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-end gap-1 pt-1 text-[10px] text-muted-foreground">
              <span>Less</span>
              {LEVEL_CLASS.map((c, i) => (
                <div key={i} className={`h-3 w-3 rounded-sm ${c}`} />
              ))}
              <span>More</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
