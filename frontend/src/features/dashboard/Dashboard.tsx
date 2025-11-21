import { useAccount } from "@/lib/hooks/useAccount";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  GuildsService,
  TopicsService,
  type ChatChannelDto,
} from "@/api/generated";
import { Button } from "@/components/ui/button";
import { Users, MessageCircle, UserSquare } from "lucide-react";

import { ChatPanel } from "./ChatPanel";
import { LiveStudyPanel } from "./LiveStudyPanel";
import { PersonalDeskPanel } from "./PersonalDeskPanel";
import { Spinner } from "@/components/shared/Spinner";

import { usePresence } from "@/lib/hooks/usePressence";
import { cn } from "@/lib/utils/utils"; // Import cn utility

export default function Dashboard() {
  const { currentUser } = useAccount();
  const guildId = currentUser?.guildId;

  // --- 1. STATE ---
  const [selectedChannel, setSelectedChannel] = useState<ChatChannelDto | null>(
    null
  );
  // 2. Update state to support three views
  const [activeView, setActiveView] = useState<"study" | "chat" | "desk">(
    "study"
  );

  // --- 2. DATA FETCHING ---
  const { data: guild, isLoading: isLoadingGuild } = useQuery({
    queryKey: ["guild", guildId],
    queryFn: () => GuildsService.getGuild(guildId!),
    enabled: !!guildId,
  });

  const { data: allTopics } = useQuery({
    queryKey: ["allTopics"],
    queryFn: () => TopicsService.getTopics(),
  });

  const { presenceList, isLoadingPresence, startStudying, stopStudying } =
    usePresence();

  // --- 4. EFFECTS ---
  useEffect(() => {
    if (guild?.channels && guild.channels.length > 0 && !selectedChannel) {
      setSelectedChannel(guild.channels[0]);
    }
  }, [guild, selectedChannel]);

  // --- 5. LOADING STATE ---
  if (isLoadingGuild || isLoadingPresence || !currentUser) {
    return (
      <div className="flex h-[calc(100dvh-4rem)] items-center justify-center">
        <Spinner size="lg" />
        <p className="ml-4 text-lg">Loading Dashboard...</p>
      </div>
    );
  }

  const currentUserPresence = presenceList.find(
    (p) => p.user.id === currentUser.id
  );

  return (
    <div className="flex flex-col p-1 lg:p-4 gap-4">
      {/* flex-1 to grow, relative for buttons, overflow-hidden to clip the slides */}
      <div className="h-[calc(100dvh-4rem)] lg:h-[calc(100dvh-8rem)] lg:flex lg:gap-4 relative overflow-hidden">
        {/* --- Sliding Container --- */}
        {/* 3. Width is 300% on mobile, 100% on desktop */}
        <div
          className={cn(
            "flex h-full transition-transform duration-300 ease-in-out",
            "w-[300%] lg:w-full lg:flex-row lg:gap-4 lg:translate-x-0",
            {
              "translate-x-0": activeView === "study",
              "-translate-x-1/3": activeView === "chat",
              "-translate-x-2/3": activeView === "desk",
            }
          )}
        >
          {/* --- Panel 1: Live Study (Left) --- */}
          {/* 4. On mobile, all panels are 1/3 of the 300% container */}
          <div className="w-1/3 lg:w-1/3 h-full">
            <div className="bg-secondary/50 rounded-lg p-4 h-full">
              <LiveStudyPanel
                presenceList={presenceList}
                topics={allTopics || []}
                onStartStudying={startStudying}
                onStopStudying={stopStudying}
                currentUserPresence={currentUserPresence}
              />
            </div>
          </div>

          {/* --- Panel 2: Chat (Middle) --- */}
          <div className="w-1/3 lg:flex-1 h-full">
            <div className="bg-secondary/50 rounded-lg p-4 h-full">
              <ChatPanel
                channelId={selectedChannel?.id}
                setActiveView={setActiveView}
              />
            </div>
          </div>

          {/* --- Panel 3: Desk (Right, Mobile-Only Slide) --- */}
          {/* 5. This slide is hidden on desktop */}
          <div className="w-1/3 lg:hidden h-full">
            <div className="bg-secondary/50 rounded-lg p-4 h-full">
              <PersonalDeskPanel />
            </div>
          </div>
        </div>

        {/* --- Mobile-only Tab Buttons --- */}
        {/* 6. Add the third button */}
        <div className="lg:hidden absolute top-0 left-1/2 -translate-x-1/2 flex gap-2 bg-background p-1 rounded-full shadow-lg border z-10">
          <Button
            size="sm"
            variant={activeView === "study" ? "default" : "ghost"}
            onClick={() => setActiveView("study")}
            className="rounded-full"
          >
            <Users className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={activeView === "chat" ? "default" : "ghost"}
            onClick={() => setActiveView("chat")}
            className="rounded-full"
          >
            <MessageCircle className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={activeView === "desk" ? "default" : "ghost"}
            onClick={() => setActiveView("desk")}
            className="rounded-full"
          >
            <UserSquare className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* --- 2. Bottom Panel: Personal Desk (Desktop-Only) --- */}
      {/* 7. This is hidden on mobile and shows on desktop */}
      <div className="hidden lg:block w-full bg-secondary/50 rounded-lg p-4">
        <PersonalDeskPanel />
      </div>
    </div>
  );
}
