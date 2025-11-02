import { useState } from "react";
import { NavLink } from "react-router"; 
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { UserActions } from "./UserActions"; 

interface NavLinkItem {
  to: string;
  label: string;
}

interface MobileNavProps {
  navLinks: NavLinkItem[];
}

export function MobileNav({ navLinks }: MobileNavProps) {
  const [isSheetOpen, setSheetOpen] = useState(false);

  return (
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
                onClick={() => setSheetOpen(false)} // Close sheet on navigation
                className={({ isActive }) =>
                  `px-4 py-2 rounded-md text-lg transition-colors hover:bg-secondary ${
                    isActive ? "text-primary font-semibold" : "text-foreground/70"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <div className="pt-6 border-t">
              <UserActions />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}