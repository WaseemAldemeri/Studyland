import { mockChatMessages } from "@/data/mockData";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { type FormEvent, useState } from "react";

// This is a placeholder for the current user's ID
const CURRENT_USER_ID = "3"; 

export function ChatPanel() {
  // State to manage the content of the message input
  const [newMessage, setNewMessage] = useState("");
  
  // For now, we'll just use the mock data
  const messages = mockChatMessages;

  // Handler to simulate sending a message
  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault(); // Prevent the form from causing a page reload
    if (newMessage.trim() === "") return; // Don't send empty messages

    console.log("Sending message:", newMessage);
    // In the future, this will send the message via SignalR
    
    setNewMessage(""); // Clear the input field after sending
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Community Hub</CardTitle>
      </CardHeader>
      
      {/* The flex-1 and overflow-y-auto are key to making the chat scrollable */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
          // We conditionally render based on the message type
          msg.type === 'system' ? (
            <div key={msg.id} className="text-center text-xs text-foreground/50 italic">
              --- {msg.text} ({new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}) ---
            </div>
          ) : (
            <div 
              key={msg.id} 
              className={`flex items-start gap-3 ${
                // This is a simple way to align the current user's messages to the right
                msg.userId === CURRENT_USER_ID ? 'flex-row-reverse' : ''
              }`}
            >
              <Avatar className="w-8 h-8">
                <AvatarImage src={msg.avatarUrl} />
                <AvatarFallback>{msg.displayName?.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <div className={`p-3 rounded-lg max-w-xs lg:max-w-md ${
                msg.userId === CURRENT_USER_ID ? 'bg-primary text-primary-foreground' : 'bg-secondary'
              }`}>
                <p className="text-sm font-semibold">{msg.displayName}</p>
                <p className="text-sm wrap-break-word">{msg.text}</p>
                <p className="text-xs text-right opacity-70 mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          )
        ))}
      </CardContent>

      <CardFooter>
        <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
          <Input
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            autoComplete="off"
          />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}