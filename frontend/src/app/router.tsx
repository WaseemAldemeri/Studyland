import { createBrowserRouter } from "react-router";
import MainLayout from "./MainLayout";
import Home from "@/pages/home/Home";
import Dashboard from "@/pages/dashboard/Dashboard";
import Stats from "@/pages/stats/Stats";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
        { path: "", element: <Home />},
        { path: "/dashboard", element: <Dashboard /> },
        { path: "/stats", element: <Stats /> },
    ],
  },
]);
