import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle, Clock, Play, StopCircle } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { TickingTimer } from "./TickingTimer";
import { Progress } from "@/components/ui/progress"; // Import Progress
import { useSounds } from "@/lib/hooks/useSounds";

// Import the DTOs
import {
  type UserPressenceDto,
  type TopicDto,
  type PressenceStatus,
  type UserDailyGoalDto,
} from "@/api/generated";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils/utils";
import { DailyGoalModal } from "./DailyGoalFormModal";

// --- 1. Define Props ---
interface LiveStudyPanelProps {
  presenceList: UserPressenceDto[];
  topics: TopicDto[];
  currentUserPresence?: UserPressenceDto;
  currentUserGoal?: UserDailyGoalDto;
  onStartStudying: (topicId: string) => void;
  onStopStudying: () => void;
}

// --- Status Sorter ---
const statusSortPriority: Record<PressenceStatus, number> = {
  STUDYING: 1,
  ONLINE: 2,
  OFFLINE: 3,
  ON_BREAK: 4,
};

export function LiveStudyPanel({
  presenceList,
  topics,
  currentUserPresence,
  currentUserGoal,
  onStartStudying,
  onStopStudying,
}: LiveStudyPanelProps) {
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const { playStartStudyingClickSound, playStopStudyingClickSound } =
    useSounds();

  const isStudying = currentUserPresence?.status === "STUDYING";

  const sortedPresenceList = useMemo(() => {
    // ... (sorting logic is unchanged)
    return [...presenceList].sort((a, b) => {
      if (a.user.id === currentUserPresence?.user.id) return -1;
      if (b.user.id === currentUserPresence?.user.id) return 1;
      const statusA = statusSortPriority[a.status];
      const statusB = statusSortPriority[b.status];
      if (statusA !== statusB) {
        return statusA - statusB;
      }
      return a.user.displayName.localeCompare(b.user.displayName);
    });
  }, [presenceList, currentUserPresence]);

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

  // --- Handlers ---
  const handleStartStudying = () => {
    if (!selectedTopicId) {
      toast.error("Please select a topic first!");
      return;
    }
    onStartStudying(selectedTopicId);
    playStartStudyingClickSound();
  };

  const handleStopStudying = () => {
    onStopStudying();
    playStopStudyingClickSound();
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader></CardHeader>
      <CardContent className="flex flex-col flex-1 gap-6">
        {/* --- Current User's Controls --- */}
        <div className="space-y-4 py-4 px-4 bg-secondary/50 rounded-lg">
          {/* --- NEW COMPACT GOAL BAR --- */}
          <DailyGoalBar
            userGoal={currentUserGoal}
            onOpenGoalModal={() => setIsGoalModalOpen(true)}
          />

          <Separator />

          <Select
            onValueChange={(value) => setSelectedTopicId(value)}
            disabled={isStudying}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a topic..." />
            </SelectTrigger>
            <SelectContent>
              {topics.map((topic) => (
                <SelectItem key={topic.id} value={topic.id}>
                  {topic.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {!isStudying ? (
            <Button className="w-full" onClick={handleStartStudying}>
              <Play className="mr-2 h-4 w-4" />
              Start Studying
            </Button>
          ) : (
            <Button
              variant="destructive"
              className="w-full bg-red-300"
              onClick={handleStopStudying}
            >
              <StopCircle className="mr-2 h-4 w-4" />
              Stop Studying
            </Button>
          )}
        </div>

        {/* --- List of All Users (Sorted) --- */}
        <div className="flex-1 space-y-4 overflow-y-auto">
          {sortedPresenceList.map((p) => (
            <LiveUserListItem
              key={p.user.id}
              presence={p}
              isCurrentUser={p.user.id === currentUserPresence?.user.id}
            />
          ))}
        </div>
        <DailyGoalModal
          isOpen={isGoalModalOpen}
          onClose={() => setIsGoalModalOpen(false)}
          currentGoalMs={currentUserGoal?.dailyGoalMs}
        />
      </CardContent>
    </Card>
  );
}

// --- Helper: Goal Bar Sub-Component ---
function DailyGoalBar({ userGoal, onOpenGoalModal }: { userGoal?: UserDailyGoalDto, onOpenGoalModal: () => void; }) {
  const progressPercentage = Math.min(userGoal?.percentageCompleted ?? 0, 100);

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
          Today's Goal
          {progressPercentage === 100 && (
            <span>
              <CheckCircle />
            </span>
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

// --- Helper: List Item Sub-Component (Unchanged) ---
function LiveUserListItem({
  presence,
  isCurrentUser,
}: {
  presence: UserPressenceDto;
  isCurrentUser: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-4 p-2 rounded-lg ${
        isCurrentUser ? "bg-primary/10" : ""
      }`}
    >
      <Avatar className="border-primary border">
        <AvatarImage src={presence.user.displayName} />
        <AvatarFallback>
          {presence.user.displayName.substring(0, 1)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1">
        <p className="font-medium">{presence.user.displayName}</p>
        <p className="text-sm text-foreground/70">
          {presence.status === "STUDYING" && presence.topic ? (
            <span className="text-primary">{presence.topic.title}</span>
          ) : (
            <span className="italic">{presence.status.toLowerCase()}</span>
          )}
        </p>
      </div>

      {presence.status === "STUDYING" && (
        <div className="flex items-center text-sm text-primary">
          <Clock className="mr-1 h-4 w-4" />
          <TickingTimer startTime={presence.startedAt} />
        </div>
      )}

      {presence.status === "ONLINE" && (
        <div className="w-2 h-2 bg-green-500 rounded-full" />
      )}
    </div>
  );
}
