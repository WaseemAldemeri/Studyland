import { Headphones, Volume2, Square, Loader2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/utils";
import { useAccount } from "@/lib/hooks/useAccount";
import { useAmbientSound } from "./useAmbientSound";
import { AMBIENCE, RADIO, type Sound } from "./sounds";

export function AmbientPlayer() {
  const { currentUser } = useAccount();
  const { currentId, volume, isBuffering, isPlaying, toggle, stop, setVolume } =
    useAmbientSound();

  if (!currentUser) return null;

  const Tile = ({ sound }: { sound: Sound }) => {
    const active = currentId === sound.id;
    return (
      <button
        onClick={() => toggle(sound)}
        className={cn(
          "flex flex-col items-center gap-1 rounded-lg border p-2 transition-colors",
          active
            ? "border-primary bg-primary/10 text-primary"
            : "border-transparent hover:bg-muted"
        )}
      >
        <span className="relative text-xl leading-none">
          {active && isBuffering ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            sound.emoji
          )}
        </span>
        <span className="text-[11px] leading-tight">{sound.label}</span>
      </button>
    );
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            size="icon-lg"
            className={cn(
              "rounded-full shadow-lg",
              isPlaying && "ring-2 ring-primary ring-offset-2"
            )}
            aria-label="Focus sounds"
          >
            {isBuffering ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Headphones className="h-5 w-5" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          side="top"
          align="start"
          className="w-72 space-y-3 bg-background shadow-xl"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Focus sounds</p>
            {isPlaying && (
              <button
                onClick={stop}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <Square className="h-3 w-3" /> Stop
              </button>
            )}
          </div>

          <div className="space-y-1">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Ambience
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {AMBIENCE.map((s) => (
                <Tile key={s.id} sound={s} />
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Radio
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {RADIO.map((s) => (
                <Tile key={s.id} sound={s} />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 border-t pt-3">
            <Volume2 className="h-4 w-4 text-muted-foreground" />
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="h-1 w-full cursor-pointer accent-primary"
              aria-label="Volume"
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
