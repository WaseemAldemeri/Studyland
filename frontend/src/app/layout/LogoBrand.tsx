import { NavLink } from "react-router"; // Corrected import
import { BrainCircuit } from "lucide-react";

export function LogoBrand() {
  return (
    <NavLink to="/" className="mr-8 flex items-center space-x-2">
      <BrainCircuit className="h-6 w-6 text-primary" />
      <span className="font-bold">Studyland</span>
    </NavLink>
  );
}
