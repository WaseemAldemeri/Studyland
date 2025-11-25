import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { type UserPressenceDto, GuildsService } from "@/api/generated";
import { HubEvents } from "@/api/signalR/ChatHubTypes";
import { useAccount } from "@/lib/hooks/useAccount";
import { useSounds } from "./useSounds";
import { useSignalR } from "../context/SignalRContext";

export function usePresence(
  sendLocalSystemMessage?: (content: string) => void
) {
  const client = useSignalR(); // 2. Get the global, persistent client

  const queryClient = useQueryClient();
  const { currentUser } = useAccount();
  const guildId = currentUser?.guildId;
  const { playUserStartedStudyingSound, playUserStoppedStudyingSound, playStartBreakSound, playStopBreakSound } =
    useSounds();

  // The 'master list' query
  const { data: presenceList, isLoading: isLoadingPresence } = useQuery({
    queryKey: ["guildMembers", guildId],
    queryFn: () => GuildsService.getGuildMembers(guildId!),
    enabled: !!guildId,
    staleTime: Infinity, // i think this must be infinity else we will show offline every 5 minutes
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
      if (sendLocalSystemMessage) {
        sendLocalSystemMessage(
          `${updatedUser.user.displayName} has started studying ${updatedUser.topic?.title}`
        );
      }
      if (updatedUser.user.id !== currentUser.id)
        playUserStartedStudyingSound();
    };

    const onUserStoppedStudying = (updatedUser: UserPressenceDto) => {
      onUserPresenceUpdate(updatedUser);
      if (sendLocalSystemMessage) {
        sendLocalSystemMessage(
          `${updatedUser.user.displayName} has stopped studying`
        );
      }
      if (updatedUser.user.id !== currentUser.id)
        playUserStoppedStudyingSound();
    };
    
    const onUserStartedBreak = (updatedUser: UserPressenceDto) => {
      onUserPresenceUpdate(updatedUser);
      if (updatedUser.user.id === currentUser.id)
        playStartBreakSound();
    }

    const onUserStoppedBreak = (updatedUser: UserPressenceDto) => {
      onUserPresenceUpdate(updatedUser);
      if (updatedUser.user.id === currentUser.id)
        playStopBreakSound();
    }

    // --- Subscriptions ---
    client.on(HubEvents.RecievePressenceList, onReceivePresenceList);
    // All these events now use the SAME callback
    client.on(HubEvents.UserJoinedChannel, onUserPresenceUpdate);
    client.on(HubEvents.UserStartedStudying, onUserStartedStudying);
    client.on(HubEvents.UserStoppedStudying, onUserStoppedStudying);
    client.on(HubEvents.UserLeftChannel, onUserPresenceUpdate);
    client.on(HubEvents.UserStartedBreak, onUserStartedBreak);
    client.on(HubEvents.UserStoppedBreak, onUserStoppedBreak);

    // --- THE CLEANUP ---
    return () => {
      client.off(HubEvents.RecievePressenceList, onReceivePresenceList);
      client.off(HubEvents.UserJoinedChannel, onUserPresenceUpdate);
      client.off(HubEvents.UserStartedStudying, onUserStartedStudying);
      client.off(HubEvents.UserStoppedStudying, onUserStoppedStudying);
      client.off(HubEvents.UserLeftChannel, onUserPresenceUpdate);
      client.off(HubEvents.UserStartedBreak, onUserStartedBreak);
      client.off(HubEvents.UserStoppedBreak, onUserStoppedBreak);
    };
  }, [
    client,
    guildId,
    queryClient,
    playUserStartedStudyingSound,
    playUserStoppedStudyingSound,
    currentUser,
    sendLocalSystemMessage,
    playStartBreakSound,
    playStopBreakSound
  ]);

  return {
    presenceList: presenceList || [],
    isLoadingPresence,

    startStudying: async (
      topicId: string,
      workMinutes?: number,
      breakMinutes?: number
    ) =>
      await client?.invoke("StartStudying", topicId, workMinutes, breakMinutes),

    stopStudying: async () => await client?.invoke("StopStudying"),
      
    startBreak: async (durationMinutes: number) => 
        await client?.invoke("StartBreak", durationMinutes),

    stopBreak: async () =>
        await client?.invoke("StopBreak"),
  };
}
