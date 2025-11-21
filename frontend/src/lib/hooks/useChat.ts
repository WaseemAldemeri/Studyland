import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChatMessagesService, type ChatMessageDto, type UserDto } from "@/api/generated";
import { useSounds } from "./useSounds";
import { useSignalR } from "@/lib/context/SignalRContext"; // <-- 1. Get global client
import { HubEvents } from "@/api/signalR/ChatHubTypes";

export function useChat(channelId?: string) {
  const queryClient = useQueryClient();
  const client = useSignalR(); // 2. Get the global, persistent client
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
      ChatMessagesService.getMessages(channelId!, pageParam ?? undefined, 5),
    initialPageParam: "",
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    select: (data) => data.pages.flatMap((page) => page.items).reverse(),
    enabled: !!channelId,
    staleTime: 5 * 60 * 1000,
  });

  const [liveMessages, setLiveMessages] = useState<ChatMessageDto[]>([]);

  const messages = useMemo(
    () => [...serverMessages ?? [], ...liveMessages],
    [serverMessages, liveMessages]
  );

  // --- 3. This effect now only manages LISTENERS ---
  useEffect(() => {
    // Wait for both the client (global) and channelId (local)
    if (!client || !channelId) {
      setLiveMessages([]);
      return;
    }

    const onReceiveMessage = (newMessage: ChatMessageDto) => {
      playMessageSound();
      setLiveMessages((prev) => [...prev, newMessage]);
    };

    client.on(HubEvents.ReceiveMessage, onReceiveMessage);

    client.invoke("JoinChannel", channelId);

    return () => {
      client.off(HubEvents.ReceiveMessage, onReceiveMessage);
    };
  }, [channelId, client, queryClient, playMessageSound]);

  // --- 4. Functions ---
  const sendMessage = (messageContent: string) => {
    client.invoke("SendMessage", messageContent);
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

  }, [setLiveMessages]);

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
