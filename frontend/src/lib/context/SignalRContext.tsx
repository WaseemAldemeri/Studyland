import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { HubConnectionBuilder, HubConnectionState } from "@microsoft/signalr";
import { ChatHubClient, HUB_URL } from "@/api/signalR/ChatHubClient";
import { FullPageLoader } from "@/components/shared/FullPageLoader"; // <-- Import your loader
import { useAccount } from "../hooks/useAccount";

// 1. Create the Context to hold the client
const SignalRContext = createContext<ChatHubClient | null>(null);

// 2. Create the Provider component
export function SignalRProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAccount();

  const [client, setClient] = useState<ChatHubClient | null>(null);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    const connection = new HubConnectionBuilder()
      .withUrl(HUB_URL, {
        accessTokenFactory: () => localStorage.getItem("access-token") || "",
      })
      .withAutomaticReconnect()
      .build();

    const chatClient = new ChatHubClient(connection);

    const startConnection = async () => {
      try {
        await connection.start();
        console.log("✅ SignalR Connected Globally.");
        setClient(chatClient);
      } catch (e) {
        console.error("❌ SignalR Connection failed: ", e);
      }
    };

    startConnection();

    const attemptReconnect = async () => {
      console.log(`hub state is: ${connection.state}`)
      if (connection.state === HubConnectionState.Disconnected) {
        console.log("Attempting to reconnect to chat hub.");
        await startConnection();
      }
    };

    // window.addEventListener("pageshow", attemptReconnect);
    document.addEventListener("visibilitychange", attemptReconnect);

    return () => {
      // window.removeEventListener("pageshow", attemptReconnect);
      document.removeEventListener("visibilitychange", attemptReconnect);
      connection.stop();
      setClient(null);
      console.log("SignalR Disconnected.");
    };
  }, [currentUser]);

  // If the client is not yet connected, show a loader
  // and do not render the rest of the app.
  if (!client && currentUser) {
    return <FullPageLoader />;
  }
  // Only render children *after* the client is ready and non-null
  return (
    <SignalRContext.Provider value={client}>{children}</SignalRContext.Provider>
  );
}

// 3. Create a custom hook to easily access the client
// This ensures the client is not null before use
// eslint-disable-next-line react-refresh/only-export-components
export const useSignalR = () => {
  const context = useContext(SignalRContext);
  if (!context) {
    throw new Error("useSignalR must be used within a SignalRProvider");
  }
  return context;
};
