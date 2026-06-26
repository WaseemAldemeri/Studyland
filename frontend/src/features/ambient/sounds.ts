// Focus sounds: looping ambient nature/place recordings (bundled, royalty-free
// from the Moodist library — Pixabay-sourced, MIT) plus a few live radio streams.

export type SoundKind = "ambience" | "radio";

export interface Sound {
  id: string;
  label: string;
  emoji: string;
  kind: SoundKind;
  src: string;
  /** Backup stream host, used once on error (radio only). */
  fallback?: string;
  loop: boolean;
}

const loop = (id: string, label: string, emoji: string): Sound => ({
  id,
  label,
  emoji,
  kind: "ambience",
  src: `/sounds/ambient/${id}.mp3`,
  loop: true,
});

export const AMBIENCE: Sound[] = [
  loop("rain", "Rain", "🌧️"),
  loop("thunder", "Storm", "⛈️"),
  loop("waves", "Beach", "🌊"),
  loop("wind", "Wind", "🍃"),
  loop("cafe", "Café", "☕"),
  loop("campfire", "Campfire", "🔥"),
  loop("river", "River", "🏞️"),
  loop("forest", "Forest", "🌲"),
  loop("library", "Library", "📚"),
];

export const RADIO: Sound[] = [
  {
    id: "lofi",
    label: "Lo-fi",
    emoji: "🎧",
    kind: "radio",
    src: "https://ice2.somafm.com/fluid-128-mp3",
    fallback: "https://ice4.somafm.com/fluid-128-mp3",
    loop: false,
  },
  {
    id: "classical",
    label: "Classical",
    emoji: "🎻",
    kind: "radio",
    src: "https://audio-mp3.ibiblio.org/wcpe.mp3",
    loop: false,
  },
  {
    id: "quran",
    label: "Quran",
    emoji: "📿",
    kind: "radio",
    src: "https://qurango.net/radio/tarateel",
    loop: false,
  },
];

export const ALL_SOUNDS: Sound[] = [...AMBIENCE, ...RADIO];
