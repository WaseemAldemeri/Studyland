import { useAccount } from "@/lib/hooks/useAccount";
import { Outlet, useLocation, useNavigate } from "react-router";

export default function RequireAuth() {
  const { currentUser, currentUserLoading } = useAccount();
  const navigate = useNavigate();
  
  const location = useLocation();

  if (currentUserLoading) return <div>Loading...</div>;

  if (!currentUser) navigate("/login", {state: {from: location} });

  return <Outlet />;
}
