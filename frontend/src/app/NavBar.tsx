import { NavLink } from "react-router"; // CORRECT IMPORT
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BrainCircuit, User, Settings, LogOut, Menu } from "lucide-react";
import { useState } from "react";

// Helper component for the user dropdown to avoid repeating code
function UserDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10 border-2 border-primary/50">
            <AvatarImage
              src="https://api.dicebear.com/7.x/lorelei/svg?seed=Waseem"
              alt="User Avatar"
            />
            <AvatarFallback>WM</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Waseem</p>
            <p className="text-xs leading-none text-foreground/70">
              waseem@example.com
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Main NavBar Component
export default function NavBar() {
  const [isSheetOpen, setSheetOpen] = useState(false);

  const navLinks = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/stats", label: "My Stats" },
  ];

  // Define styles using the new theme colors
  const activeLinkStyle =
    "text-primary font-semibold border-b-2 border-primary";
  const inactiveLinkStyle = "text-foreground/70 border-b-2 border-transparent";

  return (
    // FIX: Corrected gradient class `bg-gradient-to-r`
    <header
      className="sticky top-0 z-50 w-full border-b backdrop-blur bg-linear-to-r from-secondary via-secondary/70 to-background/80"
    >
      <nav className="container flex h-16 items-center">
        {/* --- Left Side: Brand --- */}
        <NavLink to="/" className="mr-8 flex items-center space-x-2">
          <BrainCircuit className="h-6 w-6 text-primary" />
          <span className="font-bold">Studyland</span>
        </NavLink>

        {/* --- Center: Desktop Navigation --- */}
        <ul className="hidden h-full md:flex items-center space-x-8 text-sm font-medium">
          {navLinks.map((link) => (
            <motion.li key={link.to} className="h-full flex items-center">
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `h-full flex items-center transition-colors hover:text-primary ${
                    isActive ? activeLinkStyle : inactiveLinkStyle
                  }`
                }
              >
                {link.label}
              </NavLink>
            </motion.li>
          ))}
        </ul>

        {/* Spacer */}
        <div className="flex flex-1 items-center justify-end" />

        {/* --- Right Side: Desktop Actions (Theme toggle removed) --- */}
        <div className="hidden md:flex items-center space-x-2">
          <UserDropdown />
        </div>

        {/* --- Mobile Menu (Hamburger) --- */}
        <div className="md:hidden">
          <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col space-y-6 pt-6">
                <span className="text-lg font-semibold pl-4">Menu</span>
                {navLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={() => setSheetOpen(false)} // Close sheet on nav
                    className={({ isActive }) =>
                      `px-4 py-2 rounded-md text-lg transition-colors hover:bg-secondary ${
                        isActive
                          ? "text-primary font-semibold"
                          : "text-foreground/70"
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
                <div className="pt-6 border-t">
                  <UserDropdown />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
