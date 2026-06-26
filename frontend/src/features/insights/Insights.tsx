import { useRecords, useHeatmap, useMilestones } from "./queries";
import { StreakHero } from "./StreakHero";
import { RecordsGrid } from "./RecordsGrid";
import { StudyHeatmap } from "./StudyHeatmap";
import { RecapCard } from "./RecapCard";
import { AchievementsGrid } from "./AchievementsGrid";
import { useMilestoneToasts } from "./useMilestoneToasts";

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-lg font-semibold tracking-tight text-foreground/90">
      {children}
    </h2>
  );
}

export default function Insights() {
  const { data: records, isLoading: recordsLoading } = useRecords();
  const { data: heatmap, isLoading: heatmapLoading } = useHeatmap(365);
  const { data: milestones, isLoading: milestonesLoading } = useMilestones();

  useMilestoneToasts(milestones);

  return (
    <div className="container mx-auto space-y-10 p-4 md:p-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">My Journey</h1>
        <p className="text-muted-foreground">
          Your streaks, records, and everything you've achieved so far.
        </p>
      </div>

      <StreakHero records={records} isLoading={recordsLoading} />

      <section className="space-y-4">
        <SectionHeading>Personal records</SectionHeading>
        <RecordsGrid records={records} isLoading={recordsLoading} />
      </section>

      <section className="space-y-4">
        <StudyHeatmap data={heatmap} isLoading={heatmapLoading} />
      </section>

      <section className="space-y-4">
        <SectionHeading>Recap</SectionHeading>
        <RecapCard />
      </section>

      <section className="space-y-4">
        <SectionHeading>Achievements</SectionHeading>
        <AchievementsGrid
          milestones={milestones}
          isLoading={milestonesLoading}
        />
      </section>
    </div>
  );
}
