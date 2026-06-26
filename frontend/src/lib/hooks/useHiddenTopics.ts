import { useCallback, useEffect, useState } from "react";

// Per-user UI preference: topics the user has chosen to hide from the study
// topic picker. Stored locally (not on the backend) because hiding is a
// personal view setting, not a change to the shared topic list.
const STORAGE_KEY = "studyland-hidden-topic-ids";

function load(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? new Set(parsed as string[]) : new Set();
  } catch {
    return new Set();
  }
}

export function useHiddenTopics() {
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(load);

  // Persist whenever the set changes.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...hiddenIds]));
  }, [hiddenIds]);

  const hide = useCallback((id: string) => {
    setHiddenIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const unhide = useCallback((id: string) => {
    setHiddenIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const unhideAll = useCallback(() => setHiddenIds(new Set()), []);

  const isHidden = useCallback((id: string) => hiddenIds.has(id), [hiddenIds]);

  return { hiddenIds, hide, unhide, unhideAll, isHidden };
}
