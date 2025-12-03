import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChatMessagesService, type ChatMessageDto, type UserDto } from "@/api/generated";
import { useSounds } from "./useSounds";
import { useSignalR } from "@/lib/context/SignalRContext";
import { HubEvents } from "@/api/signalR/ChatHubTypes";

export function useChat(channelId?: string) {
  const queryClient = useQueryClient();
  const { client, registerReconnectAction } = useSignalR(); // Get the registry function
  const { playMessageSound } = useSounds();

  const {
    data: serverMessages,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["chatMessages", channelId],
    queryFn: ({ pageParam }) =>
      ChatMessagesService.getMessages(channelId!, pageParam ?? undefined, 25),
    initialPageParam: "",
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    select: (data) => data.pages.flatMap((page) => page.items).reverse(),
    enabled: !!channelId,
    staleTime: 5 * 60 * 1000,
  });

  const [liveMessages, setLiveMessages] = useState<ChatMessageDto[]>([]);

  const messages = useMemo(
    () => [...(serverMessages ?? []), ...liveMessages],
    [serverMessages, liveMessages]
  );

  // Define the logic to join the channel
  const joinChannel = useCallback(() => {
    if (!client || !channelId) return;
    console.log(`Joining channel: ${channelId}`);
    client.invoke("JoinChannel", channelId).catch(err => console.error("JoinChannel failed", err));
  }, [client, channelId]);

  useEffect(() => {
    if (!client || !channelId) {
      setLiveMessages([]);
      return;
    }

    // 1. Setup Listener
    const onReceiveMessage = (newMessage: ChatMessageDto) => {
      playMessageSound();
      setLiveMessages((prev) => [...prev, newMessage]);
    };
    client.on(HubEvents.ReceiveMessage, onReceiveMessage);

    // 2. Perform Initial Join
    joinChannel();

    // 3. Register for future Reconnects (Self-healing)
    // This tells the Provider: "If we disconnect, please run 'joinChannel' again when we come back"
    const unregisterReconnect = registerReconnectAction(joinChannel);

    return () => {
      client.off(HubEvents.ReceiveMessage, onReceiveMessage);
      unregisterReconnect(); // Stop listening for reconnects if we unmount
    };
  }, [channelId, client, queryClient, playMessageSound, joinChannel, registerReconnectAction]);

  // --- Functions ---
  const sendMessage = (messageContent: string) => {
    client?.invoke("SendMessage", messageContent);
  };

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

    setLiveMessages((prev) => [...prev, systemMessage]);
  }, []);

  return {
    messages: messages || [],
    sendMessage,
    sendLocalSystemMessage,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  };
}