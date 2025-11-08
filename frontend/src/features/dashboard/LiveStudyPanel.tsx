// src/components/dashboard/LiveStudyPanel.tsx

import { mockLiveSessions, mockTopics } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, Play, StopCircle } from "lucide-react";
import { useState } from "react";

// This is the shape of the data for the current user's session
interface CurrentUserSession {
  isStudying: boolean;
  startTime: Date | null;
  selectedTopicId: string | null;
}

export function LiveStudyPanel() {
  // --- STATE ---
  // This state will manage the current user's study session
  const [currentUserSession, setCurrentUserSession] = useState<CurrentUserSession>({
    isStudying: false,
    startTime: null,
    selectedTopicId: null,
  });
  
  // For now, we'll use mock data for the list of live users
  const liveUsers = mockLiveSessions;
  const topics = mockTopics;

  // --- HANDLERS ---
  const handleStartStudying = () => {
    if (!currentUserSession.selectedTopicId) {
      alert("Please select a topic first!");
      return;
    }
    setCurrentUserSession({ ...currentUserSession, isStudying: true, startTime: new Date() });
    console.log("Started studying topic:", currentUserSession.selectedTopicId);
  };

  const handleStopStudying = () => {
    setCurrentUserSession({ ...currentUserSession, isStudying: false, startTime: null });
    // In the future, we will calculate duration and send to the backend here.
    console.log("Stopped studying.");
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          Live Study Room
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 gap-6">
        {/* --- Current User's Controls --- */}
        <div className="space-y-4 p-4 bg-secondary/50 rounded-lg">
          <Select
            onValueChange={(value) => setCurrentUserSession({ ...currentUserSession, selectedTopicId: value })}
            disabled={currentUserSession.isStudying}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a topic..." />
            </SelectTrigger>
            <SelectContent>
              {topics.map(topic => (
                <SelectItem key={topic.id} value={topic.id}>{topic.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {!currentUserSession.isStudying ? (
            <Button className="w-full" onClick={handleStartStudying}>
              <Play className="mr-2 h-4 w-4" />
              Start Studying
            </Button>
          ) : (
            <Button variant="destructive" className="w-full bg-red-300" onClick={handleStopStudying}>
              <StopCircle className="mr-2 h-4 w-4" />
              Stop Studying
            </Button>
          )}
        </div>

        {/* --- List of Other Studying Users --- */}
        <div className="flex-1 space-y-4 overflow-y-auto">
          <h3 className="font-semibold">Currently Studying</h3>
          {liveUsers.map(user => (
            <div key={user.userId} className="flex items-center gap-4">
              <Avatar>
                <AvatarImage src={user.avatarUrl} />
                <AvatarFallback>{user.displayName.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium">{user.displayName}</p>
                <p className="text-sm text-foreground/70">{user.topic}</p>
              </div>
              <div className="flex items-center text-sm text-primary">
                <Clock className="mr-1 h-4 w-4" />
                {/* We will make this timer live in the next step */}
                <span>1h 30m</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}