import { Toaster } from "@/components/ui/sonner";
import NavBar from "./layout/NavBar";
import { Outlet } from "react-router";

export default function MainLayout() {
  return (
    <div className="font-mono antialiased">
      <Toaster position="bottom-right" duration={3000} richColors theme="light" />
      <NavBar />
      <main className="container mx-auto p-4">
        <Outlet />
      </main>
    </div>
  );
}
