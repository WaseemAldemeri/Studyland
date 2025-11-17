import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { HubConnectionBuilder } from "@microsoft/signalr";
import { ChatHubClient, HUB_URL } from "@/api/signalR/ChatHubClient";
import { FullPageLoader } from "@/components/shared/FullPageLoader"; // <-- Import your loader
import { useAccount } from "../hooks/useAccount";

// 1. Create the Context to hold the client
const SignalRContext = createContext<ChatHubClient | null>(null);

// 2. Create the Provider component
export function SignalRProvider({ children }: { children: ReactNode }) {
  // make sure user is authenticated
  const { currentUser } = useAccount();

  const [client, setClient] = useState<ChatHubClient | null>(null);
  const connectedRef = useRef(false);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    if (connectedRef.current) {
      return () => {
        console.log("Stopping SignalR connection.");
        connection.stop();
      };
    }

    const connection = new HubConnectionBuilder()
      .withUrl(HUB_URL, {
        accessTokenFactory: () => localStorage.getItem("access-token") || "",
      })
      .withAutomaticReconnect()
      .build();

    const chatClient = new ChatHubClient(connection);

    connection
      .start()
      .then(() => {
        console.log("SignalR Connected Globally.");
        setClient(chatClient);
        connectedRef.current = true;
      })
      .catch((e) => console.error("SignalR Global Connection failed: ", e));

    return;
  }, [currentUser, client]);

  // --- THIS IS THE FIX ---
  // If the client is not yet connected, show a loader
  // and do not render the rest of the app.
  if (!client && currentUser) {
    return <FullPageLoader />;
  }
  // --- END OF FIX ---

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
