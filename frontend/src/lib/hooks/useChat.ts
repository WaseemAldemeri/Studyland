import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { HubConnectionBuilder } from "@microsoft/signalr";
import { ChatHubClient, HUB_URL } from "@/api/signalR/ChatHubClient";
import {
  ChatMessagesService,
  type ChatMessageDto,
} from "@/api/generated";
import { useSounds } from "./useSounds";

export function useChat(channelId?: string) {
  const queryClient = useQueryClient();
  const [client, setClient] = useState<ChatHubClient | null>(null);
  const {playMessageSound} = useSounds();

  // 1. --- CHAT HISTORY (REST) ---
  // A single query to get ALL messages. We'll add pagination later.
  const { data: messages, isLoading: isLoadingMessages } = useQuery({
    queryKey: ["chatMessages", channelId],
    queryFn: () => ChatMessagesService.getMessages(channelId!),
    enabled: !!channelId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // 2. --- SIGNALR CONNECTION ---
  useEffect(() => {
    if (!channelId) return;

    const connection = new HubConnectionBuilder()
      .withUrl(HUB_URL, {
        accessTokenFactory: () => localStorage.getItem("access-token") || "",
      })
      .withAutomaticReconnect()
      .build();

    const chatClient = new ChatHubClient(connection);

    // --- Setup Listeners ---
    // A new message arrives
    chatClient.on("ReceiveMessage", (newMessage) => {
      playMessageSound();
      // Add the new message to React Query's cache
      queryClient.setQueryData(
        ["chatMessages", channelId],
        (oldData: ChatMessageDto[] | undefined) => {
          return [...(oldData || []), newMessage];
        }
      );
    });

    // Start connection and join channel
    connection
      .start()
      .then(() => {
        chatClient.invoke("JoinChannel", channelId);
      })
      .catch((e) => console.error("SignalR Connection failed: ", e));

    setClient(chatClient);

    // Cleanup
    return () => {
      connection.stop();
    };
  }, [channelId, queryClient, playMessageSound]);

  // 3. --- EXPOSE FUNCTIONS & DATA ---
  const sendMessage = (messageContent: string) => {
    if (!client) {
      console.log("Not connected to client")
    }
    client?.invoke("SendMessage", messageContent);
  };

  return {
    client, // We export this so the Presence hook can use the same connection
    messages: messages || [], // Return messages or an empty array
    sendMessage,
    isLoadingMessages,
  };
}