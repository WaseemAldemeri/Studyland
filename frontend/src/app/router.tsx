import { createBrowserRouter } from "react-router";
import MainLayout from "./MainLayout";
import Home from "@/features/home/Home";
import Dashboard from "@/features/dashboard/Dashboard";
import Stats from "@/features/stats/Stats";
import { NotFound } from "@/features/errors/NotFound";
import { ServerError } from "@/features/errors/ServerError";
import LoginPage from "@/features/auth/LoginPage";
import RegisterPage from "@/features/auth/RegisterPage";
import RequireAuth from "./RequireAuth";

export const router = createBrowserRouter([
  { path: "", element: <Home /> },
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        element: <RequireAuth />,
        children: [
          { path: "/dashboard", element: <Dashboard /> },
          { path: "/stats", element: <Stats /> },
        ],
      },
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },

      { path: "/server-error", element: <ServerError /> },
      { path: "/not-found", element: <NotFound /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);
