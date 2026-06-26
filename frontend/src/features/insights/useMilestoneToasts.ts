import { useEffect } from "react";
import { toast } from "sonner";
import type { MilestoneDto } from "@/api/generated";

const SEEN_KEY = "studyland-seen-milestones";

/**
 * Toasts milestones that have become earned since the last visit.
 * On the very first run it silently records what's already earned so a returning
 * user isn't spammed with a toast for every historical achievement at once.
 */
export function useMilestoneToasts(milestones?: MilestoneDto[]) {
  useEffect(() => {
    if (!milestones) return;
    const earnedKeys = milestones.filter((m) => m.earned).map((m) => m.key);

    const raw = localStorage.getItem(SEEN_KEY);
    if (raw === null) {
      localStorage.setItem(SEEN_KEY, JSON.stringify(earnedKeys));
      return;
    }

    let seen: Set<string>;
    try {
      seen = new Set(JSON.parse(raw) as string[]);
    } catch {
      seen = new Set();
    }

    const fresh = milestones.filter((m) => m.earned && !seen.has(m.key));
    if (fresh.length === 0) return;

    fresh.forEach((m) =>
      toast.success(`🏆 Achievement unlocked: ${m.title}`, {
        description: m.description,
        duration: 6000,
      })
    );
    localStorage.setItem(
      SEEN_KEY,
      JSON.stringify([...seen, ...fresh.map((m) => m.key)])
    );
  }, [milestones]);
}
