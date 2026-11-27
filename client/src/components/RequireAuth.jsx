import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUser } from "../context/user-context.js";

export function RequireAuth() {
  const { user, authLoading } = useUser();
  const location = useLocation();

  if (authLoading) {
    return <div className="p-3 text-center">Loading...</div>;
  }

  if (!user) {
    return (
      <Navigate to="/sign-in" state={{ from: location.pathname }} replace />
    );
  }

  return <Outlet />;
}
