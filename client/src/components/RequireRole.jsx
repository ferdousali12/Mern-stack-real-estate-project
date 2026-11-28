import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "../context/user-context.js";

export function RequireRole({ roles }) {
  const { user, authLoading } = useUser();

  if (authLoading) {
    return <div className="p-3 text-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/sign-in" replace />;
  }

  if (!roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
