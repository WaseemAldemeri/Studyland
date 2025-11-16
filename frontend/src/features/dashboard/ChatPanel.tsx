import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { type FormEvent, useState, useEffect, useRef } from "react";
import { useAccount } from "@/lib/hooks/useAccount";

// 1. Import the DTO from your generated types
import type { ChatMessageDto } from "@/api/generated";
import { Spinner } from "@/components/shared/Spinner";

// 2. Define the props this component will receive
interface ChatPanelProps {
  messages: ChatMessageDto[];
  sendMessage: (message: string) => void;
  isLoading: boolean;
}

export function ChatPanel({
  messages,
  sendMessage,
  isLoading,
}: ChatPanelProps) {
  // 3. Get the real current user
  const { currentUser } = useAccount();

  // State to manage the content of the message input
  const [newMessage, setNewMessage] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null); // For auto-scrolling

  // 4. Handler now calls the function from props
  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === "") return;

    sendMessage(newMessage);
    setNewMessage(""); // Clear the input field
  };

  // 5. Auto-scroll to bottom when new messages are added
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Card className="h-full flex flex-col">
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* 6. Show a spinner while loading history */}
        {isLoading && (
          <div className="flex h-full w-full items-center justify-center">
            <Spinner size="lg" />
          </div>
        )}

        {/* 7. Render messages using DTO properties */}
        {!isLoading &&
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                // Use the real current user's ID
                msg.user.id === currentUser?.id ? "flex-row-reverse" : ""
              }`}
            >
              <Avatar className="w-8 h-8 border border-primary">
                <AvatarImage src={msg.user.displayName} />
                <AvatarFallback>
                  {msg.user.displayName?.substring(0, 1)}
                </AvatarFallback>
              </Avatar>
              <div
                className={`p-3 rounded-lg max-w-xs lg:max-w-md ${
                  msg.user.id === currentUser?.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary"
                }`}
              >
                <p className="text-sm font-semibold">
                  {msg.user.displayName}
                </p>
                {/* Use 'body' from the DTO, not 'text' */}
                <p className="text-sm wrap-break-word">{msg.content}</p>
                <p className="text-xs text-right opacity-70 mt-1">
                  {/* Use 'sentAt' from the DTO, not 'timestamp' */}
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}
        {/* This div is an invisible marker at the end of the chat */}
        <div ref={chatEndRef} />
      </CardContent>

      <CardFooter>
        <form
          onSubmit={handleSendMessage}
          className="flex w-full items-center space-x-2"
        >
          <Input
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            autoComplete="off"
            disabled={isLoading} // Disable input while loading
          />
          <Button type="submit" size="icon" disabled={isLoading}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}