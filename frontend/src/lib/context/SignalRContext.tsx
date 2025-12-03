import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { HubConnectionBuilder, HubConnectionState } from "@microsoft/signalr";
import { ChatHubClient, HUB_URL } from "@/api/signalR/ChatHubClient";
import { FullPageLoader } from "@/components/shared/FullPageLoader";
import { useAccount } from "../hooks/useAccount";

// Define the shape of our new Context
interface SignalRContextValue {
  client: ChatHubClient | null;
  /**
   * Registers a callback to be run whenever SignalR successfully reconnects.
   * Returns a function to unregister (cleanup) the callback.
   */
  registerReconnectAction: (action: () => void) => () => void;
}

const SignalRContext = createContext<SignalRContextValue | null>(null);

export function SignalRProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAccount();
  const [client, setClient] = useState<ChatHubClient | null>(null);

  // We use a ref for tasks so we can access the current list inside 
  // the SignalR event callback without needing to reset the listener.
  const reconnectActions = useRef<Array<() => void>>([]);

  const registerReconnectAction = useCallback((action: () => void) => {
    reconnectActions.current.push(action);
    // Return cleanup function to remove this specific action
    return () => {
      reconnectActions.current = reconnectActions.current.filter((a) => a !== action);
    };
  }, []);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    // 1. Build Connection
    const connection = new HubConnectionBuilder()
      .withUrl(HUB_URL, {
        accessTokenFactory: () => localStorage.getItem("access-token") || "",
      })
      .withAutomaticReconnect() // Crucial: handles the sleep/wake retry loop
      .build();

    const chatClient = new ChatHubClient(connection);

    // 2. Define Start Logic
    const startConnection = async () => {
      try {
        if (connection.state === HubConnectionState.Disconnected) {
          await connection.start();
          console.log("✅ SignalR Connected Globally.");
          setClient(chatClient);
        }
      } catch (e) {
        console.error("❌ SignalR Connection failed: ", e);
      }
    };

    // 3. Handle "Soft" Reconnects (AutomaticReconnect)
    // This fires when SignalR recovers the connection without losing the client instance
    connection.onreconnected(() => {
      console.log("🔄 SignalR Auto-Reconnected. Refetching subscriptions...");
      reconnectActions.current.forEach((action) => {
        try {
          action();
        } catch (err) {
          console.error("Error executing reconnect action:", err);
        }
      });
    });

    connection.onclose((error) => {
      console.warn("⚠️ SignalR Connection closed.", error);
    });

    // 4. Initial Start
    startConnection();

    // 5. Handle "Hard" Reconnects (Page Sleep/Mobile Backgrounding)
    // Sometimes the browser kills the socket entirely. We use pageshow to force a check.
    const handlePageShow = async () => {
      if (document.visibilityState === "visible" && connection.state === HubConnectionState.Disconnected) {
        console.log("📱 Tab woke up & Disconnected. Force restarting...");
        await startConnection();
        // If we force restarted, we essentially have a "new" connection, 
        // but the client state might persist. Let's force run actions just in case.
        reconnectActions.current.forEach((action) => action());
      }
    };

    window.addEventListener("pageshow", handlePageShow);
    document.addEventListener("visibilitychange", handlePageShow);

    // 6. Cleanup
    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      document.removeEventListener("visibilitychange", handlePageShow);
      connection.stop();
      setClient(null);
      console.log("SignalR Disconnected (Cleanup).");
    };
  }, [currentUser]); // Re-run only if user changes

  // Loading State
  if (!client && currentUser) {
    return <FullPageLoader />;
  }

  const contextValue ={ client, registerReconnectAction };

  return (
    <SignalRContext.Provider value={contextValue}>
      {children}
    </SignalRContext.Provider>
  );
}

// Hook
// eslint-disable-next-line react-refresh/only-export-components
export const useSignalR = () => {
  const context = useContext(SignalRContext);
  if (!context) {
    throw new Error("useSignalR must be used within a SignalRProvider");
  }
  return context;
};