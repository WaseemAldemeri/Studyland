// src/components/dashboard/MyPersonalDesk.tsx

import { mockDailyGoal, mockDailyLeaderboard, mockTodaySessions } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Trophy, BookOpen } from "lucide-react";

// This is a placeholder for the current user's name to highlight them in the leaderboard
const CURRENT_USER_NAME = "Waseem";

export function PersonalDeskPanel() {
  const { goalHours, completedHours } = mockDailyGoal;
  const progressPercentage = (completedHours / goalHours) * 100;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>My Personal Desk</CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col gap-8">
        {/* --- Section 1: Daily Goal Tracker --- */}
        <div className="space-y-2">
          <h3 className="font-semibold text-center">Today's Goal</h3>
          <Progress value={progressPercentage} />
          <p className="text-center font-bold text-primary">
            {completedHours.toFixed(1)}h / {goalHours.toFixed(1)}h
          </p>
        </div>

        {/* --- Section 2: Today's Sessions --- */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Today's Sessions</h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => console.log("Open manual add session modal...")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
          <ul className="space-y-3">
            {mockTodaySessions.map(session => (
              <li key={session.id} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-foreground/50"/>
                  <span>{session.topic}</span>
                </div>
                <span className="font-medium text-foreground/70">{session.duration}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* --- Section 3: Mini-Leaderboard --- */}
        <div className="space-y-4 flex-1 flex flex-col">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <h3 className="font-semibold">Daily Rank</h3>
          </div>
          <ul className="space-y-3">
            {mockDailyLeaderboard.map(user => (
              <li 
                key={user.rank} 
                className={`flex items-center gap-3 p-2 rounded-md ${
                  // Highlight the current user's entry
                  user.displayName === CURRENT_USER_NAME ? 'bg-primary/10' : ''
                }`}
              >
                <span className="font-bold w-4 text-center">{user.rank}</span>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatarUrl} />
                  <AvatarFallback>{user.displayName.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <span className="flex-1 font-medium">{user.displayName}</span>
                <span className="font-bold text-primary">{user.hoursToday.toFixed(1)}h</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}