import { useQuery } from "@tanstack/react-query";
import { AwardsService, InsightsService } from "@/api/generated";

export const insightsKeys = {
  records: ["insights", "records"] as const,
  heatmap: (days: number) => ["insights", "heatmap", days] as const,
  recap: (period: string) => ["insights", "recap", period] as const,
  milestones: ["insights", "milestones"] as const,
};

export function useRecords() {
  return useQuery({
    queryKey: insightsKeys.records,
    queryFn: () => InsightsService.getPersonalRecords(),
  });
}

export function useHeatmap(days = 365) {
  return useQuery({
    queryKey: insightsKeys.heatmap(days),
    queryFn: () => InsightsService.getStudyHeatmap(days),
  });
}

export function useRecap(period: "week" | "month") {
  return useQuery({
    queryKey: insightsKeys.recap(period),
    queryFn: () => InsightsService.getRecap(period),
  });
}

export function useMilestones() {
  return useQuery({
    queryKey: insightsKeys.milestones,
    queryFn: () => AwardsService.getMyMilestones(),
  });
}
