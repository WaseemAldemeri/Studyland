import NavBar from "./NavBar";
import { Outlet } from "react-router";

export default function Layout() {
  return (
    <div className="font-mono antialiased">
      <NavBar />
      <main className="container mx-auto p-4">
        <Outlet />
      </main>
    </div>
  );
}
