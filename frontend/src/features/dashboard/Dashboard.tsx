import { ChatPanel } from "./ChatPanel";
import { LiveStudyPanel } from "./LiveStudyPanel";
import { PersonalDeskPanel } from "./PersonalDeskPanel";

export default function Dashboard() {
  return (
    <div className="h-[calc(100vh-4rem)] flex p-4 gap-4">
      <div className="w-1/4 bg-secondary/50 rounded-lg p-4">
        <LiveStudyPanel />
      </div>

      <div className="flex-1 bg-secondary/50 rounded-lg p-4">
        <ChatPanel />
      </div>

      <div className="w-1/4 bg-secondary/50 rounded-lg p-4">
        <PersonalDeskPanel />
      </div>
    </div>
  );
}
