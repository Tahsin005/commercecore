import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface WishlistItem {
  productVariantId: string;
  productId: string;
  name: string;
  slug: string;
  size: string;
  price: number;
}

interface GuestWishlistState {
  items: WishlistItem[];
  addItem: (item: {
    productVariantId: string;
    productId: string;
    name: string;
    slug: string;
    size: string;
    price: number;
  }) => void;
  removeItem: (productVariantId: string) => void;
  clearWishlist: () => void;
}

export const useWishlistStore = create<GuestWishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const { items } = get();
        if (!items.some((i) => i.productVariantId === item.productVariantId)) {
          set({
            items: [
              ...items,
              {
                productVariantId: item.productVariantId,
                productId: item.productId,
                name: item.name,
                slug: item.slug,
                size: item.size,
                price: item.price,
              },
            ],
          });
        }
      },

      removeItem: (productVariantId: string) => {
        set({ items: get().items.filter((i) => i.productVariantId !== productVariantId) });
      },

      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: "commercecore_guest_wishlist",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
