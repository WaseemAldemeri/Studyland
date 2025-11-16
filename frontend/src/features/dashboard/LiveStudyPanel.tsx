import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, Play, StopCircle } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { TickingTimer } from "./TickingTimer";

// Import the DTOs
import type { UserPressenceDto, TopicDto, PressenceStatus } from "@/api/generated";
import { useSounds } from "@/lib/hooks/useSounds";

// --- 1. Define Props ---
interface LiveStudyPanelProps {
  presenceList: UserPressenceDto[];
  topics: TopicDto[];
  currentUserPresence?: UserPressenceDto;
  onStartStudying: (topicId: string) => void;
  onStopStudying: () => void;
}

// --- 2. Create a Status Sorter ---
// This map assigns a "sort priority" to each status.
const statusSortPriority: Record<PressenceStatus, number> = {
  STUDYING: 1,
  ONLINE: 2,
  OFFLINE: 3,
  ON_BREAK: 4, // You can adjust this order
};

export function LiveStudyPanel({
  presenceList,
  topics,
  currentUserPresence,
  onStartStudying,
  onStopStudying,
}: LiveStudyPanelProps) {
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  
  const {playStartStudyingClickSound, playStopStudyingClickSound} = useSounds();

  // --- 3. Derive State from Props ---
  const isStudying = currentUserPresence?.status === "STUDYING";
  
  // --- 4. Create the Sorted Presence List ---
  const sortedPresenceList = useMemo(() => {
    // Make a copy to sort
    return [...presenceList].sort((a, b) => {
      // Rule 1: Current user always comes first
      if (a.user.id === currentUserPresence?.user.id) return -1;
      if (b.user.id === currentUserPresence?.user.id) return 1;

      // Rule 2: Sort by status priority
      const statusA = statusSortPriority[a.status];
      const statusB = statusSortPriority[b.status];
      if (statusA !== statusB) {
        return statusA - statusB;
      }

      // Rule 3: Tie-breaker (sort alphabetically)
      return a.user.displayName.localeCompare(b.user.displayName);
    });
  }, [presenceList, currentUserPresence]);

  // --- 5. Handlers ---
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
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          Live Study Room
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 gap-6">
        {/* --- Current User's Controls --- */}
        <div className="space-y-4 py-2 bg-secondary/50 rounded-lg">
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

        {/* --- 6. List of All Users (Sorted) --- */}
        <div className="flex-1 space-y-4 overflow-y-auto">
          {/* We now render the new sorted list */}
          {sortedPresenceList.map((p) => (
            <LiveUserListItem 
              key={p.user.id} 
              presence={p} 
              isCurrentUser={p.user.id === currentUserPresence?.user.id}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// --- 7. Helper Component ---
// I've created a sub-component to keep the list rendering clean
function LiveUserListItem({ 
  presence, 
  isCurrentUser 
}: { 
  presence: UserPressenceDto, 
  isCurrentUser: boolean 
}) {
  return (
    <div className={`flex items-center gap-4 p-2 rounded-lg ${
      isCurrentUser ? 'bg-primary/10' : ''
    }`}>
      <Avatar className="border-primary border">
        <AvatarImage src={presence.user.displayName}  />
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