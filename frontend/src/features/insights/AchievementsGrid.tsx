import { motion } from "framer-motion";
import {
  Sparkles,
  Clock,
  Flame,
  Trophy,
  GraduationCap,
  Crown,
  Target,
  CalendarCheck,
  Award,
  Gem,
  Diamond,
  ListChecks,
  Lock,
  Award as AwardIcon,
  type LucideIcon,
} from "lucide-react";
import type { MilestoneDto } from "@/api/generated";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatHours, formatMinutes, formatDay } from "./format";

const ICONS: Record<string, LucideIcon> = {
  Sparkles,
  Clock,
  Flame,
  Trophy,
  GraduationCap,
  Crown,
  Target,
  CalendarCheck,
  Award,
  Gem,
  Diamond,
  ListChecks,
};

function formatMetric(category: string, value: number): string {
  if (category === "total_hours") return formatHours(value);
  if (category === "session_minutes") return formatMinutes(value);
  return `${Math.floor(value)}`;
}

interface Props {
  milestones?: MilestoneDto[];
  isLoading: boolean;
}

export function AchievementsGrid({ milestones, isLoading }: Props) {
  if (isLoading || !milestones) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  const earnedCount = milestones.filter((m) => m.earned).length;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        <span className="font-semibold text-primary">{earnedCount}</span> of{" "}
        {milestones.length} achievements unlocked
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {milestones.map((m, i) => {
          const Icon = ICONS[m.icon] ?? AwardIcon;
          return (
            <motion.div
              key={m.key}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: i * 0.03 }}
            >
              <Card
                className={
                  m.earned
                    ? "h-full border-primary/40 bg-primary/5"
                    : "h-full opacity-80"
                }
              >
                <CardContent className="flex gap-3 p-4">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                      m.earned
                        ? "bg-primary/15 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {m.earned ? (
                      <Icon className="h-6 w-6" />
                    ) : (
                      <Lock className="h-5 w-5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-semibold">{m.title}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {m.description}
                    </p>

                    {m.earned ? (
                      <p className="mt-1 text-xs font-medium text-primary">
                        Unlocked {formatDay(m.earnedDate, "MMM d, yyyy")}
                      </p>
                    ) : (
                      <div className="mt-2">
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary/60"
                            style={{ width: `${m.progressPercent}%` }}
                          />
                        </div>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          {formatMetric(m.category, m.currentValue)} /{" "}
                          {formatMetric(m.category, m.threshold)}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
