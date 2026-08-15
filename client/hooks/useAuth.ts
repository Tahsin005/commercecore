import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";

export function useAuth() {
  const [isHydrated, setIsHydrated] = useState(false);
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setAuth = useAuthStore((state) => state.setAuth);
  const storeLogout = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const logout = () => {
    storeLogout();
    queryClient.clear();
  };

  return {
    user: isHydrated ? user : null,
    token: isHydrated ? token : null,
    isAuthenticated: isHydrated ? isAuthenticated : false,
    isAdmin: isHydrated ? Boolean(user?.isAdmin) : false,
    isHydrated,
    setAuth,
    logout,
  };
}
