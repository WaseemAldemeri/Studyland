import { Link } from "react-router"; // Assuming React Router
import { useQuery } from "@tanstack/react-query";
import { Target, History, ExternalLink, Clock, BookOpen } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/shared/Spinner";

import { useAccount } from "@/lib/hooks/useAccount";
import { cn } from "@/lib/utils/utils";
import { type UserDailyGoalDto, SessionsService } from "@/api/generated";

interface PersonalDeskPanelProps {
  allUsersGoals: UserDailyGoalDto[];
  isLoadingGoals: boolean;
}

export function PersonalDeskPanel({
  allUsersGoals,
  isLoadingGoals,
}: PersonalDeskPanelProps) {
  const { currentUser } = useAccount();

  // --- 1. FETCH TODAY'S SESSIONS (Read Only) ---
  // We fetch this specifically for the "My Log" section
  const todayStr = new Date().toLocaleDateString();
  const { data: todaySessions, isLoading: isLoadingSessions } = useQuery({
    queryKey: ["sessionDetails", todayStr], // Keyed by date so it updates tomorrow
    queryFn: () => SessionsService.getSessions(todayStr),
    enabled: !!currentUser,
  });

  // --- Helper: MS to Hours ---
  const msToHours = (ms: number) => Number((ms / (1000 * 60 * 60)).toFixed(1));

  // --- Sort Community List ---
  // Sort by % completed (Motivation) OR Total Hours (Leaderboard).
  // Let's stick to Total Hours for ranking, but show the Goal context.
  const communityList = [...allUsersGoals].sort(
    (a, b) => b.totalStudiedMs - a.totalStudiedMs
  );

  return (
    <Card className="h-full flex flex-col border-none shadow-none bg-transparent gap-4">
      {/* =======================================================
          SECTION 1: MY SESSION LOG (Read Only)
         ======================================================= */}
      <div className="h-1/3 min-h-[200px] flex flex-col bg-secondary/30 rounded-xl overflow-hidden border">
        <div className="p-3 bg-secondary/50 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm">My Log (Today)</span>
          </div>

          <Button variant="ghost" size="icon" className="h-6 w-6" asChild>
            <Link to="/stats" title="Manage Sessions">
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground hover:text-primary" />
            </Link>
          </Button>
        </div>

        <ScrollArea className="flex-1 p-0">
          {isLoadingSessions ? (
            <div className="h-full flex items-center justify-center">
              <Spinner size="sm" />
            </div>
          ) : !todaySessions || todaySessions.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-4 gap-2 opacity-50">
              <History className="h-8 w-8 text-muted-foreground/50" />
              <p className="text-xs text-muted-foreground">
                No sessions recorded yet today.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {todaySessions.map((session) => (
                <div
                  key={session.id}
                  className="p-3 flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <div className="flex flex-col gap-0.5 overflow-hidden">
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="h-3 w-3 text-primary/70" />
                      <span className="text-sm font-medium truncate max-w-[120px]">
                        {session.topic.title}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground pl-4.5">
                      {new Date(session.startedAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-background/50 px-2 py-1 rounded text-xs font-mono border">
                    <Clock className="h-3 w-3 opacity-50" />
                    {session.duration.slice(0, 5)} {/* HH:mm */}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* =======================================================
          SECTION 2: COMMUNITY GOALS (All Users)
         ======================================================= */}
      <div className="flex-1 flex flex-col min-h-0 bg-secondary/30 rounded-xl overflow-hidden border">
        <div className="p-3 bg-secondary/50 border-b flex items-center justify-between sticky top-0 backdrop-blur-sm z-10">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm">Community Goals For Today</span>
          </div>
        </div>

        <ScrollArea className="flex-1 p-3">
          <div className="space-y-4">
            {isLoadingGoals && (
              <div className="p-4 flex justify-center">
                <Spinner />
              </div>
            )}

            {!isLoadingGoals &&
              communityList.map((data) => {
                const isMe = data.user.id === currentUser?.id;
                const percentage = Math.min(data.percentageCompleted, 100);
                const studiedHrs = msToHours(data.totalStudiedMs);
                const goalHrs = msToHours(data.dailyGoalMs);

                return (
                  <div key={data.user.id} className="space-y-1">
                    {/* User Header */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6 border">
                          <AvatarImage src={undefined} />
                          <AvatarFallback className="text-[10px]">
                            {data.user.displayName
                              ?.substring(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span
                          className={cn("font-medium", isMe && "text-primary")}
                        >
                          {data.user.displayName} {isMe && "(You)"}
                        </span>
                      </div>
                      <span className="text-muted-foreground">
                        <span className="font-bold text-foreground">
                          {studiedHrs}h
                        </span>{" "}
                        / {goalHrs}h
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="pl-8">
                      <Progress
                        value={percentage}
                        className={cn(
                          "h-1.5",
                          percentage === 100 && "bg-green-500"
                        )}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </ScrollArea>
      </div>
    </Card>
  );
}
