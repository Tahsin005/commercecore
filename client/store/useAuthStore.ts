import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useCartStore } from "./useCartStore";
import { useWishlistStore } from "./useWishlistStore";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  isAdmin: boolean;
  hasPassword?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  setAuthUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user: User, token: string) => {
        if (typeof window !== "undefined") {
          document.cookie = `commercecore_token=${token}; path=/; max-age=2592000; SameSite=Lax`;
        }
        set({
          user,
          token,
          isAuthenticated: true,
        });
      },

      setAuthUser: (user: User) => {
        set({
          user,
        });
      },

      logout: () => {
        if (typeof window !== "undefined") {
          document.cookie = "commercecore_token=; path=/; max-age=0; SameSite=Lax";
          try {
            localStorage.removeItem("commercecore_auth_store");
            localStorage.removeItem("commercecore_guest_cart");
            localStorage.removeItem("commercecore_guest_wishlist");
          } catch (err) {
            console.error("Failed to clear localStorage on logout:", err);
          }
        }

        // reset all Zustand stores
        useCartStore.getState().clearCart();
        useWishlistStore.getState().clearWishlist();

        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: "commercecore_auth_store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
