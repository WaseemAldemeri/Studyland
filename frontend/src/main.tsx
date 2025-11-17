import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router";
import "./index.css";
import { router } from "./app/router";
import { SignalRProvider } from "./lib/context/SignalRContext";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <SignalRProvider>
        <RouterProvider router={router} />
      </SignalRProvider>
    </QueryClientProvider>
  </StrictMode>
);
