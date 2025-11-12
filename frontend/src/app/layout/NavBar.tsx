// src/components/layout/navbar/NavBar.tsx

// Import all the modular pieces
import { LogoBrand } from "./LogoBrand";
import { DesktopNav } from "./DesktopNav";
import { MobileNav } from "./MobileNav";
import { UserActions } from "./UserActions";
import { NavLink } from "react-router";
import { useAccount } from "@/lib/hooks/useAccount";

export default function NavBar() {
  // Define the navigation links in one central place
  const navLinks = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/stats", label: "My Stats" },
  ];

  const activeLinkStyle =
    "text-primary font-semibold border-b-2 border-primary";
  const inactiveLinkStyle = "text-foreground/70 border-b-2 border-transparent";

  const { currentUser } = useAccount();

  return (
    <header className="sticky top-0 z-50 w-full border-b backdrop-blur bg-linear-to-r from-primary/30 via-secondary to-background/80">
      <nav className="mx-2 flex h-16 items-center justify-between md:justify-around">
        <LogoBrand />

        <DesktopNav navLinks={navLinks} />

        {/* Desktop user actions are separate from the mobile nav */}

        <div className="hidden md:flex items-center h-16">
          {!currentUser ? (
            <NavLink
              to={"/login"}
              className={({ isActive }) =>
                `h-full flex items-center transition-colors text-sm hover:text-primary ${
                  isActive ? activeLinkStyle : inactiveLinkStyle
                }`
              }
            >
              Login
            </NavLink>
          ) : (
            <UserActions />
          )}
        </div>

        <MobileNav navLinks={navLinks} />
      </nav>
    </header>
  );
}
