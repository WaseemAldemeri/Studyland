import { ChatPanel } from "./ChatPanel";
import { LiveStudyPanel } from "./LiveStudyPanel";
import { PersonalDeskPanel } from "./PersonalDeskPanel";

export default function Dashboard() {
  return (
    // Main container for the entire page below the navbar
    <div className="h-[calc(100vh-4rem)] flex p-4 gap-4">
      {/* --- Left Panel: Live Study Room --- */}
      <div className="w-1/4 bg-secondary/50 rounded-lg p-4">
        {/* <h2 className="text-xl font-bold text-primary mb-4">Live Study Room</h2> */}
        <LiveStudyPanel />
      </div>

      {/* --- Center Panel: Community Hub --- */}
      <div className="flex-1 bg-secondary/50 rounded-lg p-4">
        <ChatPanel />
      </div>

      {/* --- Right Panel: My Personal Desk --- */}
      <div className="w-1/4 bg-secondary/50 rounded-lg p-4">
        <PersonalDeskPanel />
      </div>
    </div>
  );
}
