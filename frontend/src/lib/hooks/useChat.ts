import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { ChatMessagesService, type ChatMessageDto } from "@/api/generated";
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

    // --- Setup Listeners ---
    const onReceiveMessage = (newMessage: ChatMessageDto) => {
      playMessageSound();
      setLiveMessages((prev) => [...prev, newMessage]);
    };

    client.on(HubEvents.ReceiveMessage, onReceiveMessage);

    // Tell the server we are now in this channel
    client.invoke("JoinChannel", channelId);

    // --- Cleanup ---
    // This runs when the component unmounts OR channelId changes
    return () => {
      client.off(HubEvents.ReceiveMessage, onReceiveMessage);
      // We could invoke "LeaveChannel" here if we wanted
    };
  }, [channelId, client, queryClient, playMessageSound]);

  // --- 4. Functions ---
  const sendMessage = (messageContent: string) => {
    client.invoke("SendMessage", messageContent);
  };

  return {
    messages: messages || [],
    sendMessage,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  };
}
