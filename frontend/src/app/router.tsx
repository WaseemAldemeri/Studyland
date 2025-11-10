import { createBrowserRouter } from "react-router";
import MainLayout from "./MainLayout";
import Home from "@/features/home/Home";
import Dashboard from "@/features/dashboard/Dashboard";
import Stats from "@/features/stats/Stats";
import { NotFound } from "@/features/errors/NotFound";
import { ServerError } from "@/features/errors/ServerError";
import LoginPage from "@/features/auth/LoginPage";
import RegisterPage from "@/features/auth/RegisterPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
        { path: "", element: <Home />},
        { path: "/dashboard", element: <Dashboard /> },
        { path: "/stats", element: <Stats /> },
        { path: '/login', element: <LoginPage /> },
        { path: '/register', element: <RegisterPage /> },


        { path: "/server-error", element: <ServerError /> },
        { path: "/not-found", element: <NotFound /> },
        { path: "*", element: <NotFound /> },
    ],
  },
]);
