import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";

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
    useCartStore.getState().clearCart();
    useWishlistStore.getState().clearWishlist();

    queryClient.clear();

    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("commercecore_auth_store");
        localStorage.removeItem("commercecore_guest_cart");
        localStorage.removeItem("commercecore_guest_wishlist");
        localStorage.clear();
      } catch (err) {
        console.error("Failed to clear localStorage on logout:", err);
      }
    }
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
