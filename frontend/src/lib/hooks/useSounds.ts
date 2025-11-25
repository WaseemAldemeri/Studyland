import { useCallback } from "react";

// 1. Create the audio objects *outside* the hook.
// This ensures they are singletons (created only once).
const messageSound = new Audio("/sounds/message-notification.wav");
const userStoppedStudyingSound = new Audio("/sounds/user-stopped-studying-notification.wav");
const userStartedStudyingSound = new Audio("/sounds/user-started-studying-notification.wav");
const startStudyingClickSound = new Audio("/sounds/start-studying-click.wav");
const stopStudyingClickSound = new Audio("/sounds/stop-studying-click.wav");
const startBreakSound = new Audio("/sounds/break-started.mp3");
const stopBreakSound = new Audio("/sounds/break-ended.mp3");

// Add any other sounds you need
// const studyStartSound = new Audio('/sounds/study-start.mp3');

// 2. Create a helper function to play audio
// This handles rewinding and errors
const playAudio = (audio: HTMLAudioElement) => {
  // Rewind to the start so you can play it multiple times
  audio.currentTime = 0;

  audio.play().catch((e) => {
    // This .catch() is essential! It will catch errors
    // from the browser's autoplay policy (see below).
    console.warn("Sound play failed:", e.message);
  });
};

// 3. Create the hook
export const useSounds = () => {
  const playMessageSound = useCallback(() => {
    playAudio(messageSound);
  }, []);

  const playUserStoppedStudyingSound = useCallback(() => {
    playAudio(userStoppedStudyingSound);
  }, []);

  const playUserStartedStudyingSound = useCallback(() => {
    playAudio(userStartedStudyingSound);
  }, []);

  const playStartStudyingClickSound = useCallback(() => {
    playAudio(startStudyingClickSound);
  }, []);

  const playStopStudyingClickSound = useCallback(() => {
    playAudio(stopStudyingClickSound);
  }, []);

  const playStartBreakSound = useCallback(() => {
    playAudio(startBreakSound);
  }, []);

  const playStopBreakSound = useCallback(() => {
    playAudio(stopBreakSound);
  }, []);

  // Return the functions for your components to use
  return {
    playMessageSound,
    playUserStoppedStudyingSound,
    playUserStartedStudyingSound,
    playStartStudyingClickSound,
    playStopStudyingClickSound,
    playStartBreakSound,
    playStopBreakSound
  };
};
