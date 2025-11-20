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
  useLayoutEffect,
} from "react";
import { useAccount } from "@/lib/hooks/useAccount";

// 1. Import the DTO from your generated types
import { Spinner } from "@/components/shared/Spinner";
import { cn } from "@/lib/utils/utils";
import { useChat } from "@/lib/hooks/useChat";
import { useInView } from "react-intersection-observer";

// 2. Define the props this component will receive
interface ChatPanelProps {
  channelId?: string;
  setActiveView: Dispatch<SetStateAction<"study" | "chat" | "desk">>;
}

export function ChatPanel({ channelId, setActiveView }: ChatPanelProps) {
  const { currentUser } = useAccount();

  const {
    messages,
    sendMessage,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useChat(channelId);

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

  // preservering scroll position after fetching next page from infinite scrolling
  const oldContainerHeight = useRef<number>(
    chatContainerRef.current?.scrollHeight ?? 0
  );
  useLayoutEffect(() => {
    const container = chatContainerRef.current;
    const oldHeight = oldContainerHeight.current;

    if (!container) return;

    // this block is to prevent preserving scrolling position when new messages arrive
    // because we want to scroll to bottom in this instance
    const newMessage = messages.at(messages.length - 1)?.id;
    if (lastMessageRef.current !== newMessage) {
      return;
    }

    if (oldHeight === container.scrollHeight) return;

    container.scrollTop = container.scrollHeight - oldHeight;
    oldContainerHeight.current = container.scrollHeight;
  }, [messages]);

  // infinite scrolling
  const { ref: endOfChatRef } = useInView({
    threshold: 0.1,
    onChange: (inView) => {
      // Only fetch if visible, has more pages, and NOT currently fetching
      if (inView && hasNextPage && !isFetchingNextPage) {
        oldContainerHeight.current =
          chatContainerRef.current?.scrollHeight ?? 0;
        fetchNextPage();
      }
    },
  });

  // 5. Auto-scroll to bottom when new messages are added
  const lastMessageRef = useRef<string | null>(null);

  useEffect(() => {
    const newMessage = messages.at(messages.length - 1)?.id;

    if (lastMessageRef.current === newMessage) {
      return;
    }

    lastMessageRef.current = newMessage ?? null;

    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, setActiveView]);

  return (
    <Card className="h-full flex flex-col">
      <CardContent
        className="flex-1 overflow-y-auto p-4 space-y-1"
        ref={chatContainerRef}
      >
        {/* 6. Show a spinner while loading history */}
        {isLoading && (
          <div className="flex h-full w-full items-center justify-center">
            <Spinner size="lg" />
          </div>
        )}

        {/* Div to trigger infinitte scrolling */}
        <div
          ref={endOfChatRef}
          className="flex h-16 w-full items-center justify-center"
        >
          {/* Show a spinner at the top when fetching new messages */}
          {isFetchingNextPage && <Spinner size="lg" />}
          {!hasNextPage && (
            <p className="text-center opacity-40 italic">-- End Of Chat --</p>
          )}
        </div>

        {/* 7. Render messages using DTO properties */}
        {!isLoading &&
          messages.map((msg, i) => {
            const prevMsgDate = i > 0 ? new Date(messages[i - 1].timestamp) : new Date();
            const thisMsgDate = new Date(msg.timestamp);

            const isSameDay =
              i > 0 && prevMsgDate.getDay() === thisMsgDate.getDay();

            const isSameUser = i > 0 && messages[i - 1].user.id === msg.user.id;

            const timeAlmostSame =
              i > 0 &&
              isSameDay &&
              thisMsgDate.getTime() - prevMsgDate.getTime() < 1000 * 60 * 5;

            return (
              <>
                {!isSameDay && <DateDivider timestamp={msg.timestamp} />}

                {!isSameUser && <div className="h-2" />}

                <div
                  key={msg.id}
                  className={cn(
                    `flex items-center gap-3 `,
                    msg.messageType === "SYSTEM" && "justify-center",
                    msg.user.id === currentUser?.id && "flex-row-reverse"
                  )}
                >
                  {msg.messageType === "USER" &&
                    (isSameUser && isSameDay ? (
                      <div className="w-8 h-8" />
                    ) : (
                      <Avatar className="w-8 h-8 border border-primary">
                        <AvatarImage src={msg.user.displayName} />
                        <AvatarFallback>
                          {msg.user.displayName?.substring(0, 1)}
                        </AvatarFallback>
                      </Avatar>
                    ))}
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
                    {msg.messageType === "USER" &&
                      !(isSameUser && isSameDay) && (
                        <p className="text-xs italic opacity-70">
                          {msg.user.displayName}
                        </p>
                      )}
                    <p className="text-sm wrap-break-word">{msg.content}</p>
                    {msg.messageType === "USER" && !timeAlmostSame && (
                      <p className="text-xs text-right opacity-70 mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}
                  </div>
                </div>
              </>
            );
          })}
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

const DateDivider = ({ timestamp }: { timestamp: string }) => {
  const dateLabel =
    new Date(timestamp).toDateString() === new Date().toDateString()
      ? "Today"
      : new Date(timestamp).toLocaleDateString();

  return (
    <div className="text-center text-xs text-gray-400 my-2">
      -- {dateLabel} --
    </div>
  );
};
