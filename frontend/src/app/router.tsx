import { createBrowserRouter, Navigate } from "react-router";
import MainLayout from "./MainLayout";
import Home from "@/pages/home/Home";
import Dashboard from "@/pages/dashboard/Dashboard";
import Stats from "@/pages/stats/Stats";
import { NotFound } from "@/pages/errors/NotFound";
import { ServerError } from "@/pages/errors/ServerError";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
        { path: "", element: <Home />},
        { path: "/dashboard", element: <Dashboard /> },
        { path: "/stats", element: <Stats /> },

        { path: "/server-error", element: <ServerError /> },
        { path: "/not-found", element: <NotFound /> },
        { path: "*", element: <Navigate replace to='not-found' />},
    ],
  },
]);
