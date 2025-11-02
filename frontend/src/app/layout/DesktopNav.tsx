import { NavLink } from "react-router"; // Corrected import
import { motion } from "framer-motion";

// Define the shape of a navigation link for type safety
interface NavLinkItem {
  to: string;
  label: string;
}

interface DesktopNavProps {
  navLinks: NavLinkItem[];
}

export function DesktopNav({ navLinks }: DesktopNavProps) {
  const activeLinkStyle = "text-primary font-semibold border-b-2 border-primary";
  const inactiveLinkStyle = "text-foreground/70 border-b-2 border-transparent";

  return (
    <ul className="hidden h-full md:flex items-center justify-center gap-10 text-sm font-medium">
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
  );
}