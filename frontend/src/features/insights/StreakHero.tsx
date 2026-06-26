import { motion } from "framer-motion";
import { Flame, Trophy, Clock } from "lucide-react";
import type { PersonalRecordsDto } from "@/api/generated";
import { Skeleton } from "@/components/ui/skeleton";
import { formatHours } from "./format";

interface Props {
  records?: PersonalRecordsDto;
  isLoading: boolean;
}

export function StreakHero({ records, isLoading }: Props) {
  if (isLoading || !records) {
    return <Skeleton className="h-44 w-full rounded-2xl" />;
  }

  const streak = records.currentStreakDays;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-orange-500/15 via-primary/10 to-background p-6 md:p-8"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex items-center gap-4">
          <motion.div
            animate={streak > 0 ? { scale: [1, 1.12, 1] } : {}}
            transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
            className="flex h-20 w-20 items-center justify-center rounded-full bg-orange-500/20"
          >
            <Flame
              className={
                streak > 0
                  ? "h-11 w-11 text-orange-500"
                  : "h-11 w-11 text-muted-foreground"
              }
            />
          </motion.div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold tracking-tight text-primary">
                {streak}
              </span>
              <span className="text-xl font-medium text-muted-foreground">
                {streak === 1 ? "day" : "days"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {streak > 0
                ? "Current study streak — keep it alive!"
                : "No active streak. Study today to start one! 🔥"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <HeroStat
            icon={Trophy}
            label="Best streak"
            value={`${records.longestStreakDays} ${
              records.longestStreakDays === 1 ? "day" : "days"
            }`}
          />
          <HeroStat
            icon={Clock}
            label="Lifetime"
            value={formatHours(records.totalHours)}
          />
        </div>
      </div>
    </motion.div>
  );
}

function HeroStat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-28 flex-col gap-1 rounded-xl border bg-background/60 px-4 py-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}
