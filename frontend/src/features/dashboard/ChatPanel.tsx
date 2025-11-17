import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import {
  type FormEvent,
  useState,
  useEffect,
  useRef,
  type Dispatch,
  type SetStateAction,
} from "react";
import { useAccount } from "@/lib/hooks/useAccount";

// 1. Import the DTO from your generated types
import type { ChatMessageDto } from "@/api/generated";
import { Spinner } from "@/components/shared/Spinner";
import { cn } from "@/lib/utils/utils";

// 2. Define the props this component will receive
interface ChatPanelProps {
  messages: ChatMessageDto[];
  sendMessage: (message: string) => void;
  isLoading: boolean;
  setActiveView: Dispatch<SetStateAction<"study" | "chat" | "desk">>;
}

export function ChatPanel({
  messages,
  sendMessage,
  isLoading,
  setActiveView,
}: ChatPanelProps) {
  // 3. Get the real current user
  const { currentUser } = useAccount();

  // State to manage the content of the message input
  const [newMessage, setNewMessage] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // 4. Handler now calls the function from props
  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === "") return;

    sendMessage(newMessage);
    setNewMessage(""); // Clear the input field
  };

  // 5. Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (chatContainerRef.current)
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
  }, [messages, setActiveView]);

  return (
    <Card className="h-full flex flex-col">
      <CardContent
        className="flex-1 overflow-y-auto p-4 space-y-6"
        ref={chatContainerRef}
      >
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
              className={cn(
                `flex items-center gap-3 `,
                msg.messageType === "SYSTEM" && "justify-center",
                msg.user.id === currentUser?.id && "flex-row-reverse"
              )}
            >
              {msg.messageType === "USER" && (
                <Avatar className="w-8 h-8 border border-primary">
                  <AvatarImage src={msg.user.displayName} />
                  <AvatarFallback>
                    {msg.user.displayName?.substring(0, 1)}
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  `p-3 rounded-lg max-w-xs lg:max-w-md`,
                  msg.user.id === currentUser?.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary",
                  msg.messageType === "SYSTEM" &&
                    "bg-parent p-1 italic text-gray-500"
                )}
              >
                {msg.messageType === "USER" && (
                  <p className="text-xs italic opacity-70">
                    {msg.user.displayName}
                  </p>
                )}
                <p className="text-sm wrap-break-word">{msg.content}</p>
                {msg.messageType === "USER" && (
                  <p className="text-xs text-right opacity-70 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}
              </div>
            </div>
          ))}
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
