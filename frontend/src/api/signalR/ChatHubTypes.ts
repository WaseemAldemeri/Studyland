import type { ChatMessageDto, UserPressenceDto } from "@/api/generated";

// --- HUB METHODS (Client-to-Server) ---
// This maps to C# IChatHub interface
export const HubMethods = {
  JoinChannel: "JoinChannel",
  SendMessage: "SendMessage",
  StartStudying: "StartStudying",
  StopStudying: "StopStudying",
  GetPressenceList: "GetPressenceList",
} as const;

// This maps the method names to their function arguments
export type HubMethodParams = {
  [HubMethods.JoinChannel]: [channelId: string];
  [HubMethods.SendMessage]: [messageContent: string];
  [HubMethods.StartStudying]: [topicId: string];
  [HubMethods.StopStudying]: [];
  [HubMethods.GetPressenceList]: [];
};

// --- HUB EVENTS (Server-to-Client) ---
// This maps to C# ChatHubEvents static class
export const HubEvents = {
  ReceiveMessage: "ReceiveMessage",
  RecievePressenceList: "RecievePressenceList",
  UserStartedStudying: "UserStartedStudying",
  UserStoppedStudying: "UserStoppedStudying",
  UserJoinedChannel: "UserJoinedChannel",
  UserLeftChannel: "UserLeftChannel",
} as const;

// This maps the event names to their callback payloads
export type HubEventCallbacks = {
  [HubEvents.ReceiveMessage]: (message: ChatMessageDto) => void;
  [HubEvents.RecievePressenceList]: (users: UserPressenceDto[]) => void;
  [HubEvents.UserStartedStudying]: (user: UserPressenceDto) => void;
  [HubEvents.UserStoppedStudying]: (user: UserPressenceDto) => void;
  [HubEvents.UserJoinedChannel]: (user: UserPressenceDto) => void;
  [HubEvents.UserLeftChannel]: (userId: UserPressenceDto) => void;
};
