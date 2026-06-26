import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Sound } from "./sounds";

const VOL_KEY = "studyland-ambient-volume";

/**
 * Plays a focus sound through a single HTMLAudioElement. Looping ambience tracks
 * are bundled assets; radio sounds stream and fall back to a backup host once.
 */
export function useAmbientSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentIdRef = useRef<string | null>(null);
  const triedFallbackRef = useRef(false);
  const soundRef = useRef<Sound | null>(null);

  const [currentId, setCurrentId] = useState<string | null>(null);
  const [isBuffering, setIsBuffering] = useState(false);
  const [volume, setVolumeState] = useState<number>(() => {
    const stored = parseFloat(localStorage.getItem(VOL_KEY) ?? "");
    return Number.isFinite(stored) ? stored : 0.6;
  });

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "none";
    audio.volume = volume;
    audioRef.current = audio;

    const onPlaying = () => setIsBuffering(false);
    const onWaiting = () => setIsBuffering(true);
    const onError = () => {
      const sound = soundRef.current;
      if (sound?.fallback && !triedFallbackRef.current) {
        triedFallbackRef.current = true;
        audio.src = sound.fallback;
        audio.play().catch(() => {});
        return;
      }
      if (currentIdRef.current) {
        toast.error("Couldn't play that sound. Try another?");
        currentIdRef.current = null;
        soundRef.current = null;
        setCurrentId(null);
        setIsBuffering(false);
      }
    };

    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("error", onError);
      audio.pause();
      audio.src = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.src = "";
    }
    currentIdRef.current = null;
    soundRef.current = null;
    setCurrentId(null);
    setIsBuffering(false);
  }, []);

  const toggle = useCallback(
    async (sound: Sound) => {
      const audio = audioRef.current;
      if (!audio) return;

      if (currentIdRef.current === sound.id) {
        stop();
        return;
      }

      triedFallbackRef.current = false;
      soundRef.current = sound;
      currentIdRef.current = sound.id;
      setCurrentId(sound.id);
      setIsBuffering(true);

      audio.loop = sound.loop;
      audio.src = sound.src;
      audio.volume = volume;
      try {
        await audio.play();
      } catch {
        setIsBuffering(false);
      }
    },
    [stop, volume]
  );

  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    localStorage.setItem(VOL_KEY, String(v));
    if (audioRef.current) audioRef.current.volume = v;
  }, []);

  return {
    currentId,
    volume,
    isBuffering,
    isPlaying: currentId !== null,
    toggle,
    stop,
    setVolume,
  };
}
