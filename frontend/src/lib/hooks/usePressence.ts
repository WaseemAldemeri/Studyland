import { useCallback, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type ChatMessageDto,
  type UserDto,
  type UserPressenceDto,
  GuildsService,
} from "@/api/generated";
import { HubEvents } from "@/api/signalR/ChatHubTypes";
import { useAccount } from "@/lib/hooks/useAccount";
import { useSounds } from "./useSounds";
import { useSignalR } from "../context/SignalRContext";

export function usePresence(channelId?: string) {
  const client = useSignalR(); // 2. Get the global, persistent client

  const queryClient = useQueryClient();
  const { currentUser } = useAccount();
  const guildId = currentUser?.guildId;
  const { playUserStartedStudyingSound, playUserStoppedStudyingSound } =
    useSounds();

  const sendLocalSystemMessage = useCallback((content: string) => {
    const systemAuthor: UserDto = {
      id: "system",
      displayName: "System",
      email: "",
      dateJoined: new Date().toISOString(),
      guildId: "",
    };

    const systemMessage: ChatMessageDto & { messageType?: "SYSTEM" } = {
      id: crypto.randomUUID(),
      content: "-- " + content + " --",
      timestamp: new Date().toISOString(),
      user: systemAuthor,
      messageType: "SYSTEM",
    };

    queryClient.setQueryData(
      ["chatMessages", channelId],
      (oldData: ChatMessageDto[] | undefined) => {
        return [...(oldData || []), systemMessage];
      }
    );
  }, [queryClient, channelId]);

  // The 'master list' query
  const { data: presenceList, isLoading: isLoadingPresence } = useQuery({
    queryKey: ["guildMembers", guildId],
    queryFn: () => GuildsService.getGuildMembers(guildId!),
    enabled: !!guildId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!client || !guildId) return;

    const queryKey = ["guildMembers", guildId];

    // --- CALLBACK 1: Handles the full list ---
    const onReceivePresenceList = (activeUsers: UserPressenceDto[]) => {
      const activeMap = new Map(activeUsers.map((u) => [u.user.id, u]));

      queryClient.setQueryData(
        queryKey,
        (oldData: UserPressenceDto[] | undefined) => {
          if (!oldData) return [];
          return oldData.map(
            (member) => activeMap.get(member.user.id) || member
          );
        }
      );
    };

    // --- CALLBACK 2: Handles ALL single-user updates ---
    const onUserPresenceUpdate = (updatedUser: UserPressenceDto) => {
      queryClient.setQueryData(
        queryKey,
        (oldData: UserPressenceDto[] | undefined) => {
          if (!oldData) return [];
          // Blindly replace the user in the list
          return oldData.map((u) =>
            u.user.id === updatedUser.user.id ? updatedUser : u
          );
        }
      );
    };

    const onUserStartedStudying = (updatedUser: UserPressenceDto) => {
      onUserPresenceUpdate(updatedUser);
      console.log("sending");
      sendLocalSystemMessage(
        `${updatedUser.user.displayName} has started studying ${updatedUser.topic?.title}`
      );
      console.log("sent");
      if (updatedUser.user.id !== currentUser.id)
        playUserStartedStudyingSound();
    };

    const onUserStoppedStudying = (updatedUser: UserPressenceDto) => {
      onUserPresenceUpdate(updatedUser);
      sendLocalSystemMessage(
        `${updatedUser.user.displayName} has stopped studying`
      );
      if (updatedUser.user.id !== currentUser.id)
        playUserStoppedStudyingSound();
    };

    // --- Subscriptions ---
    client.on(HubEvents.RecievePressenceList, onReceivePresenceList);
    // All these events now use the SAME callback
    client.on(HubEvents.UserJoinedChannel, onUserPresenceUpdate);
    client.on(HubEvents.UserStartedStudying, onUserStartedStudying);
    client.on(HubEvents.UserStoppedStudying, onUserStoppedStudying);
    client.on(HubEvents.UserLeftChannel, onUserPresenceUpdate); // <-- The change

    // --- THE CLEANUP ---
    return () => {
      client.off(HubEvents.RecievePressenceList, onReceivePresenceList);
      client.off(HubEvents.UserJoinedChannel, onUserPresenceUpdate);
      client.off(HubEvents.UserStartedStudying, onUserStartedStudying);
      client.off(HubEvents.UserStoppedStudying, onUserStoppedStudying);
      client.off(HubEvents.UserLeftChannel, onUserPresenceUpdate);
    };
  }, [
    client,
    guildId,
    queryClient,
    playUserStartedStudyingSound,
    playUserStoppedStudyingSound,
    currentUser,
    sendLocalSystemMessage
  ]);

  return {
    presenceList: presenceList || [],
    isLoadingPresence,
    startStudying: (topicId: string) =>
      client?.invoke("StartStudying", topicId),
    stopStudying: () => client?.invoke("StopStudying"),
  };
}
