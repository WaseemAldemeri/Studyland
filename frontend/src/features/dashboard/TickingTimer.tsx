import { useState, useEffect } from "react";

// A simple function to format seconds into HH:MM:SS
function formatDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const pad = (num: number) => num.toString().padStart(2, "0");

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

interface TickingTimerProps {
  startTime: string; // ISO date string from server
}

export function TickingTimer({ startTime }: TickingTimerProps) {
  const [elapsed, setElapsed] = useState("00:00:00");

  useEffect(() => {
    // Get the start time once
    const start = new Date(startTime).getTime();

    // Update the timer every second
    const intervalId = setInterval(() => {
      const now = Date.now();
      const totalSeconds = (now - start) / 1000;
      setElapsed(formatDuration(totalSeconds));
    }, 1000);

    // Cleanup the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, [startTime]);

  return <span>{elapsed}</span>;
}