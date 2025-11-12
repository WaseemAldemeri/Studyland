import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


// Helper to parse "HH:mm" into total minutes
export const parseDuration = (value: string): number => {
  if (!value || !value.includes(':')) return 0;
  const [hours, minutes] = value.split(':').map(Number);
  return (hours * 60) + minutes;
};

export const parseDurationToMs = (value: string) : number => {
  return parseDuration(value) * 60 * 1000;
}

// Helper to format total minutes into "HH:mm"
export const formatDuration = (totalMinutes: number): string => {
  if (totalMinutes < 0) totalMinutes = 0;
  const hours = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
  const minutes = (totalMinutes % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};
