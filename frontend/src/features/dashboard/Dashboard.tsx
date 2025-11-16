import { useAccount } from "@/lib/hooks/useAccount";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { GuildsService, TopicsService, type ChatChannelDto } from "@/api/generated";

// Import the child components
import { ChatPanel } from "./ChatPanel";
import { LiveStudyPanel } from "./LiveStudyPanel";
import { PersonalDeskPanel } from "./PersonalDeskPanel";

// Import the new hooks
import { useChat } from "@/lib/hooks/useChat";
import { usePresence } from "@/lib/hooks/usePressence";
import { Spinner } from "@/components/shared/Spinner";

export default function Dashboard() {
  const { currentUser } = useAccount();
  const guildId = currentUser?.guildId;

  // --- 1. STATE ---
  // This will hold the currently selected channel.
  // We'll also need a <ChannelList> component to set this later on when we support diffrent channels.
  const [selectedChannel, setSelectedChannel] = useState<ChatChannelDto | null>(null);

  // --- 2. DATA FETCHING ---
  // Fetch the main guild data (channels, topics, etc.)
  const { data: guild, isLoading: isLoadingGuild } = useQuery({
    queryKey: ["guild", guildId],
    queryFn: () => GuildsService.getGuild(guildId!),
    enabled: !!guildId,
  });

  const { data: allTopics } = useQuery({
    queryKey: ["allTopics"],
    queryFn: () => TopicsService.getTopics(),
  });
  
  // --- 3. CUSTOM HOOKS ---
  // All chat logic (connection, messages, sending) is in here
  const {
    client,
    messages,
    sendMessage,
    isLoadingMessages,
  } = useChat(selectedChannel?.id);

  // All presence logic (list, start/stop studying) is in here
  const {
    presenceList,
    isLoadingPresence,
    startStudying,
    stopStudying,
  } = usePresence(client); // Pass the client from useChat to usePresence

  // --- 4. EFFECTS ---
  // Set the default channel once the guild data is loaded
  useEffect(() => {
    if (guild?.channels && guild.channels.length > 0 && !selectedChannel) {
      setSelectedChannel(guild.channels[0]);
    }
  }, [guild, selectedChannel]);

  // --- 5. LOADING STATE ---
  if (isLoadingGuild || isLoadingPresence || !currentUser) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Spinner size="lg" />
        <p className="ml-4 text-lg">Loading Dashboard...</p>
      </div>
    );
  }

  // Find the current user's *own* presence info to pass down
  const currentUserPresence = presenceList.find(
    (p) => p.user.id === currentUser.id
  );

  return (
    <div className="h-[calc(100dvh-6rem)] flex p-4 gap-4">
      {/* --- Live Panel --- */}
      <div className="w-1/4 bg-secondary/50 rounded-lg p-4">
        <LiveStudyPanel
          presenceList={presenceList}
          // Note: You need to add topics to your GuildDto or fetch them
          // I'm passing the topics from the guild.
          topics={allTopics || []}
          onStartStudying={startStudying}
          onStopStudying={stopStudying}
          currentUserPresence={currentUserPresence}
        />
      </div>

      {/* --- Chat Panel --- */}
      <div className="flex-1 bg-secondary/50 rounded-lg p-4">
        <ChatPanel
          messages={messages}
          sendMessage={sendMessage}
          isLoading={isLoadingMessages}
        />
      </div>

      {/* --- Personal Desk (Still Static) --- */}
      <div className="w-1/4 bg-secondary/50 rounded-lg p-4">
        <PersonalDeskPanel />
      </div>
    </div>
  );
}