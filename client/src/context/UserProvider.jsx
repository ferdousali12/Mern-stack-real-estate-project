import { useEffect, useMemo, useState } from "react";
import { UserContext } from "./user-context.js";

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadUser = async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });

        if (res.ok) {
          const data = await res.json();
          if (active) setUser(data);
        } else if (active) {
          setUser(null);
        }
      } catch {
        if (active) setUser(null);
      } finally {
        if (active) setAuthLoading(false);
      }
    };

    loadUser();

    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(
    () => ({ user, setUser, authLoading }),
    [authLoading, user],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
