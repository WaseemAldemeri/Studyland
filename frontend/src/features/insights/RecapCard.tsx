import { useState } from "react";
import { format, parseISO } from "date-fns";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarClock,
  Flame,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useRecap } from "./queries";
import { formatHours, formatMinutes, formatDay } from "./format";

export function RecapCard() {
  const [period, setPeriod] = useState<"week" | "month">("week");
  const { data: recap, isLoading } = useRecap(period);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <CalendarClock className="h-4 w-4" />
          {period === "week" ? "This week" : "This month"}
        </CardTitle>
        <Tabs value={period} onValueChange={(v) => setPeriod(v as "week" | "month")}>
          <TabsList>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent>
        {isLoading || !recap ? (
          <Skeleton className="h-64 w-full rounded-xl" />
        ) : (
          <div className="space-y-6">
            <div className="flex flex-wrap items-end gap-x-8 gap-y-4">
              <div>
                <div className="text-4xl font-bold text-primary">
                  {formatHours(recap.totalHours)}
                </div>
                <Delta
                  delta={recap.deltaHours}
                  previous={recap.previousPeriodHours}
                />
              </div>
              <MiniStat label="Sessions" value={`${recap.totalSessions}`} />
              <MiniStat label="Days" value={`${recap.daysStudied}`} />
              <MiniStat
                label="Avg session"
                value={formatMinutes(recap.averageSessionMinutes)}
              />
              <MiniStat
                label="Streak"
                value={`${recap.currentStreakDays}d`}
                icon={Flame}
              />
            </div>

            {recap.totalSessions === 0 ? (
              <p className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
                No study sessions yet {period === "week" ? "this week" : "this month"}.
                Time to change that! ✨
              </p>
            ) : (
              <>
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={recap.dailyBreakdown}>
                      <XAxis
                        dataKey="date"
                        tickFormatter={(d) =>
                          format(parseISO(d), period === "week" ? "EEE" : "d")
                        }
                        tick={{ fontSize: 11 }}
                        interval={period === "week" ? 0 : "preserveStartEnd"}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        cursor={{ fill: "rgba(0,0,0,0.05)" }}
                        labelFormatter={(d) => formatDay(d as string)}
                        formatter={(value) => [formatHours(value as number), "Studied"]}
                      />
                      <Bar
                        dataKey="hours"
                        fill="var(--color-primary)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <div className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      <Sparkles className="h-3.5 w-3.5" /> Top topics
                    </div>
                    <div className="space-y-2">
                      {recap.topTopics.map((t) => {
                        const pct =
                          recap.totalHours > 0
                            ? (t.hours / recap.totalHours) * 100
                            : 0;
                        return (
                          <div key={t.topic.id}>
                            <div className="flex justify-between text-sm">
                              <span className="truncate">{t.topic.title}</span>
                              <span className="text-muted-foreground">
                                {formatHours(t.hours)}
                              </span>
                            </div>
                            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full rounded-full bg-primary"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {recap.bestDayDate && (
                    <div className="flex flex-col justify-center rounded-xl border bg-muted/30 p-4">
                      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Best day
                      </div>
                      <div className="text-xl font-bold text-primary">
                        {formatHours(recap.bestDayHours)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDay(recap.bestDayDate, "EEEE, MMM d")}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Delta({ delta, previous }: { delta: number; previous: number }) {
  if (Math.abs(delta) < 0.05) {
    return (
      <p className="text-sm text-muted-foreground">
        Same as last period · {formatHours(previous)}
      </p>
    );
  }
  const up = delta > 0;
  return (
    <p
      className={`flex items-center gap-1 text-sm ${
        up ? "text-emerald-600" : "text-orange-500"
      }`}
    >
      {up ? (
        <ArrowUpRight className="h-4 w-4" />
      ) : (
        <ArrowDownRight className="h-4 w-4" />
      )}
      {formatHours(Math.abs(delta))} {up ? "more" : "less"} than last period
    </p>
  );
}

function MiniStat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: React.ElementType;
}) {
  return (
    <div>
      <div className="flex items-center gap-1 text-xs uppercase tracking-wide text-muted-foreground">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  );
}
