import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface WishlistItem {
  productId: string;
  name: string;
  slug: string;
  price: number;
}

interface GuestWishlistState {
  items: WishlistItem[];
  addItem: (product: { id: string; name: string; slug: string; price: number }) => void;
  removeItem: (productId: string) => void;
  clearWishlist: () => void;
}

export const useWishlistStore = create<GuestWishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        const { items } = get();
        if (!items.some((i) => i.productId === product.id)) {
          set({
            items: [
              ...items,
              {
                productId: product.id,
                name: product.name,
                slug: product.slug,
                price: product.price,
              },
            ],
          });
        }
      },

      removeItem: (productId: string) => {
        set({ items: get().items.filter((i) => i.productId !== productId) });
      },

      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: "commercecore_guest_wishlist",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
