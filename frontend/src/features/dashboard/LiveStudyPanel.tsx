import { useState, useMemo, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CheckCircle,
  Play,
  StopCircle,
  Coffee,
  FileEdit,
  Watch,
} from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Utils & Hooks
import { useSounds } from "@/lib/hooks/useSounds";
import { cn } from "@/lib/utils/utils";
import { TickingTimer } from "./TickingTimer";
import { DailyGoalModal } from "./DailyGoalFormModal";

// DTOs
import {
  type UserPressenceDto,
  type TopicDto,
  type UserDailyGoalDto,
} from "@/api/generated";

// --- PROPS ---
interface LiveStudyPanelProps {
  presenceList: UserPressenceDto[];
  topics: TopicDto[];
  currentUserPresence?: UserPressenceDto;
  currentUserGoal?: UserDailyGoalDto;
  onStartStudying: (
    topicId: string,
    workMinutes?: number,
    breakMinutes?: number
  ) => void;
  onStopStudying: () => Promise<void>;
  onStartBreak: (duration: number) => Promise<void>;
  onStopBreak: () => Promise<void>;
}

const statusSortPriority: Record<string, number> = {
  STUDYING: 1,
  ON_BREAK: 2,
  ONLINE: 3,
  OFFLINE: 4,
};

// --- HELPER HOOK: Centralized Timer Logic ---
function useTimer(startedAt: string | Date, durationMinutes?: number) {
  const [percentage, setPercentage] = useState(0);
  const [timeLeft, setTimeLeft] = useState("--:--");

  useEffect(() => {
    const update = () => {
      if (!durationMinutes) {
        setPercentage(0);
        return;
      }

      const now = new Date().getTime();
      const start = new Date(startedAt).getTime();
      const totalMs = durationMinutes * 60 * 1000;
      const end = start + totalMs;
      const diff = end - now;

      if (diff <= 0) {
        setPercentage(0);
        setTimeLeft("00:00");
      } else {
        // Calculate % remaining (100% -> 0%)
        const p = Math.max(0, Math.min(100, (diff / totalMs) * 100));
        setPercentage(p);

        const m = Math.floor(diff / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${m}:${s.toString().padStart(2, "0")}`);
      }
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [startedAt, durationMinutes]);

  return { percentage, timeLeft };
}

export function LiveStudyPanel({
  presenceList,
  topics,
  currentUserPresence,
  currentUserGoal,
  onStartStudying,
  onStopStudying,
  onStartBreak,
  onStopBreak,
}: LiveStudyPanelProps) {
  const queryClient = useQueryClient();
  const { playStartStudyingClickSound, playStopStudyingClickSound } =
    useSounds();

  // --- LOCAL STATE ---
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [mode, setMode] = useState<"STOPWATCH" | "POMODORO">("STOPWATCH");
  const [pomoSettings, setPomoSettings] = useState({ work: 25, break: 5 });

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isBreakModalOpen, setIsBreakModalOpen] = useState(false);

  // Derived State
  const status = currentUserPresence?.status;
  const isStudying = status === "STUDYING";
  const isOnBreak = status === "ON_BREAK";
  const isBusy = isStudying || isOnBreak;

  // --- EFFECT: Default Topic ---
  useEffect(() => {
    if (!selectedTopicId && topics.length > 0) {
      const defaultTopic =
        topics.find((t) => t.title === "Uncategorized") || topics[0];
      if (defaultTopic) {
        setSelectedTopicId(defaultTopic.id);
      }
    }
  }, [topics, selectedTopicId]);

  // --- HANDLERS ---
  const handleStart = () => {
    if (!selectedTopicId) return toast.error("Select a topic first!");

    playStartStudyingClickSound();

    if (mode === "STOPWATCH") {
      onStartStudying(selectedTopicId, undefined, undefined);
    } else {
      onStartStudying(selectedTopicId, pomoSettings.work, pomoSettings.break);
    }
  };

  const handleStop = async () => {
    if (isOnBreak) {
      await onStopBreak();
    } else {
      await onStopStudying();
      playStopStudyingClickSound();
    }
    queryClient.invalidateQueries({ queryKey: ["sessionDetails"] });
  };

  const handleManualBreak = async (duration: number) => {
    await onStartBreak(duration);
    setIsBreakModalOpen(false);
  };

  // --- SORTING ---
  const sortedPresenceList = useMemo(() => {
    return [...presenceList].sort((a, b) => {
      if (a.user.id === currentUserPresence?.user.id) return -1;
      if (b.user.id === currentUserPresence?.user.id) return 1;
      const statusA = statusSortPriority[a.status] ?? 99;
      const statusB = statusSortPriority[b.status] ?? 99;
      if (statusA !== statusB) return statusA - statusB;
      return a.user.displayName.localeCompare(b.user.displayName);
    });
  }, [presenceList, currentUserPresence]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader />
      <CardContent className="flex flex-col flex-1 gap-6">
        {/* ================= CONTROLS SECTION ================= */}
        <div className="space-y-4 py-4 px-4 bg-white rounded-lg transition-all">
          <DailyGoalBar
            userGoal={currentUserGoal}
            onOpenGoalModal={() => setIsGoalModalOpen(true)}
          />
          <Separator />

          {/* --- STATE A: IDLE (Show Selection UI) --- */}
          {!isBusy && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
              <Select
                value={selectedTopicId || ""}
                onValueChange={setSelectedTopicId}
              >
                <SelectTrigger className="w-full bg-background">
                  <SelectValue placeholder="Select a topic..." />
                </SelectTrigger>
                <SelectContent>
                  {topics.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Tabs
                value={mode}
                onValueChange={(v) => setMode(v as "STOPWATCH" | "POMODORO")}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger
                    value="STOPWATCH"
                    className="text-xs data-[state=active]:bg-secondary"
                  >
                    <Watch />
                    Stopwatch
                  </TabsTrigger>
                  <TabsTrigger
                    value="POMODORO"
                    className="text-xs data-[state=active]:bg-secondary"
                  >
                    <div className="flex items-center gap-1">
                      <img src="pomodorotimer.svg" className="size-4" alt="pomo" />
                      Pomodoro
                    </div>{" "}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="STOPWATCH"></TabsContent>

                <TabsContent value="POMODORO" className="space-y-3 pt-2">
                  <div className="flex gap-2">
                    <div className="space-y-1 flex-1">
                      <Label className="text-[10px] uppercase text-muted-foreground">
                        Focus (m)
                      </Label>
                      <Input
                        type="number"
                        className="h-8 bg-background"
                        value={pomoSettings.work}
                        onChange={(e) =>
                          setPomoSettings((prev) => ({
                            ...prev,
                            work: parseInt(e.target.value) || 0,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-1 flex-1">
                      <Label className="text-[10px] uppercase text-muted-foreground">
                        Break (m)
                      </Label>
                      <Input
                        type="number"
                        className="h-8 bg-background"
                        value={pomoSettings.break}
                        onChange={(e) =>
                          setPomoSettings((prev) => ({
                            ...prev,
                            break: parseInt(e.target.value) || 0,
                          }))
                        }
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <Separator />

              <Button
                className="w-full"
                onClick={handleStart}
                disabled={!selectedTopicId}
              >
                <Play className="mr-2 h-4 w-4" /> Start Session
              </Button>
            </div>
          )}

          {/* --- STATE B: BUSY (Show Active UI) --- */}
          {isBusy && (
            <div className="space-y-4 animate-in fade-in zoom-in-95">
              <div
                className={cn(
                  "flex flex-col items-center justify-center py-6 rounded-xl border-2 border-dashed",
                  isOnBreak
                    ? "border-green-500/30 bg-green-500/5"
                    : "border-primary/30 bg-primary/5"
                )}
              >
                <div className="text-4xl font-mono font-bold tracking-widest text-foreground">
                  {currentUserPresence?.timerDurationMinutes ? (
                    <CountdownTimer
                      startedAt={currentUserPresence.startedAt}
                      durationMinutes={currentUserPresence.timerDurationMinutes}
                    />
                  ) : (
                    <TickingTimer
                      startTime={currentUserPresence!.startedAt}
                    />
                  )}
                </div>

                <div className="flex items-center gap-2 mt-2">
                  {isOnBreak && (
                    <span className="text-green-600 flex items-center gap-1 text-sm font-bold">
                      <Coffee className="h-4 w-4" /> On Break
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {isStudying && !currentUserPresence!.timerDurationMinutes && (
                  <Button
                    onClick={() => setIsBreakModalOpen(true)}
                    className="bg-secondary text-black"
                  >
                    <Coffee className="mr-2 h-4 w-4" /> Break
                  </Button>
                )}

                <Button
                  onClick={handleStop}
                  className={cn(
                    (isStudying &&
                      currentUserPresence!.timerDurationMinutes) ||
                      isOnBreak
                      ? "col-span-2"
                      : "",
                    "bg-secondary text-black"
                  )}
                >
                  <StopCircle className="mr-2 h-4 w-4" />
                  {isOnBreak ? "End Break" : "Stop Session"}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* ================= LIST SECTION ================= */}
        <div className="flex-1 space-y-4 overflow-y-auto pr-1">
          {sortedPresenceList.map((p) => (
            <LiveUserListItem
              key={p.user.id}
              presence={p}
              isCurrentUser={p.user.id === currentUserPresence?.user.id}
            />
          ))}
        </div>

        {/* Modals */}
        <DailyGoalModal
          isOpen={isGoalModalOpen}
          onClose={() => setIsGoalModalOpen(false)}
          currentGoalMs={currentUserGoal?.dailyGoalMs}
        />
        <BreakSelectionModal
          isOpen={isBreakModalOpen}
          onClose={() => setIsBreakModalOpen(false)}
          onConfirm={handleManualBreak}
        />
      </CardContent>
    </Card>
  );
}

// --- SUB-COMPONENTS ---

function AvatarWithProgress({
  presence,
  className,
}: {
  presence: UserPressenceDto;
  className?: string;
}) {
  const isStudying = presence.status === "STUDYING";
  const isOnBreak = presence.status === "ON_BREAK";

  // Get percentage (100 -> 0)
  const { percentage } = useTimer(
    presence.startedAt,
    presence.timerDurationMinutes!
  );

  const ringVisible = !!presence.timerDurationMinutes && (isStudying || isOnBreak);
  const colorClass = isOnBreak ?  "text-green-500" : isStudying ? "text-orange-600" : "text-primary";

  // Size Config
  // Total size of the ring container (larger than the 36px avatar)
  // 44px container - 36px avatar = 4px gap/ring space
  const containerSize = "h-[44px] w-[44px]";

  return (
    <div className={cn("relative flex items-center justify-center", containerSize, className)}>
      
      {/* --- THE CSS RING --- */}
      {ringVisible ? (
        <div
          className={cn(
            "absolute inset-0 rounded-full transition-all duration-1000 ease-linear",
            colorClass
          )}
          style={{
            // 1. The Paint: Conic gradient for the progress
            background: `conic-gradient(currentColor ${percentage}%, transparent 0)`,
            
            // 2. The Cutter: Mask out the center to create the "Rim"
            // "transparent 62%" determines the inner radius (hole size)
            // "black 63%" determines where the visible ring starts
            maskImage: "radial-gradient(closest-side, transparent 62%, black 63%)",
            WebkitMaskImage: "radial-gradient(closest-side, transparent 62%, black 63%)", // Safari support
          }}
        />
      ) : (
        // Static fallback thin border (CSS)
        <div
          className={cn(
            "absolute inset-0 rounded-full border-2 opacity-50",
            colorClass
          )}
        />
      )}

      {/* --- THE AVATAR --- */}
      {/* Added z-10 to sit nicely inside the ring, and a small border to separate it */}
      <Avatar className={cn("h-10 w-10 z-10 bg-secondary")}>
        <AvatarImage src={presence.user.displayName} />
        <AvatarFallback>
          {presence.user.displayName.substring(0, 1)}
        </AvatarFallback>
      </Avatar>
    </div>
  );
}

function LiveUserListItem({
  presence,
  isCurrentUser,
}: {
  presence: UserPressenceDto;
  isCurrentUser: boolean;
}) {
  const isStudying = presence.status === "STUDYING";
  const isOnBreak = presence.status === "ON_BREAK";
  const isOnline = presence.status === "ONLINE";
  const isOffline = presence.status === "OFFLINE";

  // Use hook just for the text display on the right
  const { timeLeft } = useTimer(
    presence.startedAt,
    presence.timerDurationMinutes!
  );

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-2 rounded-lg transition-all",
        isCurrentUser && "bg-primary/10",
        isOffline && "opacity-50 grayscale"
      )}
    >
      {/* 1. Avatar with Status Ring */}
      <AvatarWithProgress presence={presence} />

      {/* 2. User Details */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">
          {presence.user.displayName}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {isStudying && (
            <span className="text-primary font-medium">
              {presence.topic?.title}
            </span>
          )}
          {isOnBreak && (
            <span className="text-green-600 font-medium">Taking a Break</span>
          )}
          {isOnline && <span className="italic">Online</span>}
          {isOffline && <span className="italic">Offline</span>}
        </p>
      </div>

      {/* 3. Timer Text (No Ring) */}
      <div className="text-right">
        {presence.timerDurationMinutes ? (
          <div
            className={cn(
              "text-xs font-mono font-bold flex items-center gap-1.5",
              isOnBreak ? "text-green-600" : "text-orange-500"
            )}
          >
            <span>{timeLeft}</span>
            {isOnBreak ? (
              <Coffee className="size-3" />
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-3 opacity-80"
              >
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-8-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
                  opacity="0.3"
                />
                <circle cx="12" cy="12" r="7" />
              </svg>
            )}
          </div>
        ) : isStudying ? (
          <div className="text-primary text-xs font-mono flex items-center gap-1 bg-primary/5 px-2 py-1 rounded">
            <TickingTimer startTime={presence.startedAt} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function CountdownTimer({
  startedAt,
  durationMinutes,
}: {
  startedAt: string | Date;
  durationMinutes: number;
}) {
  const { timeLeft } = useTimer(startedAt, durationMinutes);
  return <span>{timeLeft}</span>;
}

function BreakSelectionModal({
  isOpen,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (m: number) => void;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Take a Break</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-4 py-4">
          {[5, 10, 15, 30, 45, 60].map((min) => (
            <Button
              key={min}
              variant="outline"
              onClick={() => onConfirm(min)}
            >
              {min}m
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DailyGoalBar({
  userGoal,
  onOpenGoalModal,
}: {
  userGoal?: UserDailyGoalDto;
  onOpenGoalModal: () => void;
}) {
  const progressPercentage = Math.min(
    userGoal?.percentageCompleted ?? 0,
    100
  );
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-xs font-medium">
        <p
          onClick={onOpenGoalModal}
          className={cn(
            "text-foreground/70 hover:cursor-pointer hover:underline flex items-center gap-2",
            progressPercentage === 100 && "text-green-500"
          )}
        >
          Today's Goal{" "}
          {progressPercentage === 100 ? (
            <CheckCircle className="size-4" />
          ) : (
            <FileEdit className="size-4" />
          )}
        </p>
        <span className="text-primary font-bold">
          {getHoutsFromMs(userGoal?.totalStudiedMs)}h /{" "}
          {getHoutsFromMs(userGoal?.dailyGoalMs)}h
        </span>
      </div>
      <Progress value={progressPercentage} className="h-2" />
    </div>
  );
}

function getHoutsFromMs(ms?: number) {
  return ((ms ?? 0) / (60 * 60 * 1000)).toFixed(1);
}