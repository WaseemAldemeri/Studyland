import { useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { type UserPressenceDto, GuildsService } from "@/api/generated";
import { HubEvents } from "@/api/signalR/ChatHubTypes";
import { useAccount } from "@/lib/hooks/useAccount";
import { useSounds } from "./useSounds";
import { useSignalR } from "../context/SignalRContext";

export function usePresence(
  sendLocalSystemMessage?: (content: string) => void
) {
  const { client, registerReconnectAction } = useSignalR(); // Get registry
  const queryClient = useQueryClient();
  const { currentUser } = useAccount();
  const guildId = currentUser?.guildId;
  const {
    playUserStartedStudyingSound,
    playUserStoppedStudyingSound,
    playStartBreakSound,
    playStopBreakSound,
    playStartStudyingClickSound,
    playStopStudyingClickSound,
  } = useSounds();

  // The 'master list' query
  const { data: presenceList, isLoading: isLoadingPresence } = useQuery({
    queryKey: ["guildMembers", guildId],
    queryFn: () => GuildsService.getGuildMembers(guildId!),
    enabled: !!guildId,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  // Define the logic to refresh presence
  const refreshPresence = useCallback(() => {
    if(client) {
        console.log("Refreshing presence list...");
        client.invoke("GetPressenceList").catch(err => console.error("GetPressenceList failed", err));
    }
  }, [client]);

  useEffect(() => {
    if (!client || !guildId) return;

    const queryKey = ["guildMembers", guildId];

    // --- CALLBACKS ---
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

    const onUserPresenceUpdate = (updatedUser: UserPressenceDto) => {
      queryClient.setQueryData(
        queryKey,
        (oldData: UserPressenceDto[] | undefined) => {
          if (!oldData) return [];
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
      if (updatedUser.user.id !== currentUser.id) {
        playUserStartedStudyingSound();
      } else {
        playStartStudyingClickSound();
      }
    };

    const onUserStoppedStudying = (updatedUser: UserPressenceDto) => {
      onUserPresenceUpdate(updatedUser);
      if (sendLocalSystemMessage) {
        sendLocalSystemMessage(
          `${updatedUser.user.displayName} has stopped studying`
        );
      }
      if (updatedUser.user.id !== currentUser.id) {
        playUserStoppedStudyingSound();
      } else {
        playStopStudyingClickSound();
        queryClient.invalidateQueries({ queryKey: ["sessionDetails"] });
      }
      queryClient.invalidateQueries({ queryKey: ["guildGoals"] });
    };

    const onUserStartedBreak = (updatedUser: UserPressenceDto) => {
      onUserPresenceUpdate(updatedUser);
      if (updatedUser.user.id === currentUser.id) {
        playStartBreakSound();
        queryClient.invalidateQueries({ queryKey: ["sessionDetails"] });
      }
      queryClient.invalidateQueries({ queryKey: ["guildGoals"] });
    };

    const onUserStoppedBreak = (updatedUser: UserPressenceDto) => {
      onUserPresenceUpdate(updatedUser);
      if (updatedUser.user.id === currentUser.id) playStopBreakSound();
    };

    // --- Subscriptions ---
    client.on(HubEvents.RecievePressenceList, onReceivePresenceList);
    client.on(HubEvents.UserJoinedChannel, onUserPresenceUpdate);
    client.on(HubEvents.UserStartedStudying, onUserStartedStudying);
    client.on(HubEvents.UserStoppedStudying, onUserStoppedStudying);
    client.on(HubEvents.UserLeftChannel, onUserPresenceUpdate);
    client.on(HubEvents.UserStartedBreak, onUserStartedBreak);
    client.on(HubEvents.UserStoppedBreak, onUserStoppedBreak);

    // --- Initial Action ---
    // We might not want to invoke this immediately if the HTTP query handles the initial load,
    // but we definitely want to invoke it on Reconnect.
    // If you want to ensure sync on mount, uncomment next line:
    // refreshPresence(); 

    // --- Register for Reconnects ---
    const unregisterReconnect = registerReconnectAction(refreshPresence);

    // --- Cleanup ---
    return () => {
      client.off(HubEvents.RecievePressenceList, onReceivePresenceList);
      client.off(HubEvents.UserJoinedChannel, onUserPresenceUpdate);
      client.off(HubEvents.UserStartedStudying, onUserStartedStudying);
      client.off(HubEvents.UserStoppedStudying, onUserStoppedStudying);
      client.off(HubEvents.UserLeftChannel, onUserPresenceUpdate);
      client.off(HubEvents.UserStartedBreak, onUserStartedBreak);
      client.off(HubEvents.UserStoppedBreak, onUserStoppedBreak);
      
      unregisterReconnect();
    };
  }, [
    client,
    guildId,
    queryClient,
    currentUser,
    sendLocalSystemMessage,
    playUserStartedStudyingSound,
    playUserStoppedStudyingSound,
    playStartBreakSound,
    playStopBreakSound,
    playStartStudyingClickSound,
    playStopStudyingClickSound,
    refreshPresence,
    registerReconnectAction
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

    stopBreak: async () => await client?.invoke("StopBreak"),
  };
}