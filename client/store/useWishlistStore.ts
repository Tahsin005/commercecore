import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface WishlistItem {
  productId: string;
  productVariantId?: string;
  name: string;
  slug: string;
  size?: string;
  color?: string;
  price: number;
  imageUrl?: string;
}

interface GuestWishlistState {
  items: WishlistItem[];
  addItem: (item: {
    productId: string;
    productVariantId?: string;
    name: string;
    slug: string;
    size?: string;
    color?: string;
    price: number;
    imageUrl?: string;
  }) => void;
  removeItem: (id: string, color?: string) => void;
  clearWishlist: () => void;
}

export const useWishlistStore = create<GuestWishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const { items } = get();
        const targetProductId = item.productId || item.productVariantId;
        if (!targetProductId) return;

        const cleanColor = item.color && item.color.trim() ? item.color.trim() : undefined;

        const exists = items.some((i) => {
          const sameProduct = (i.productId || i.productVariantId) === targetProductId;
          const sameVariant = (i.productVariantId || undefined) === (item.productVariantId || undefined);
          const sameColor = (i.color || undefined) === cleanColor;

          return sameProduct && sameVariant && sameColor;
        });

        if (!exists) {
          set({
            items: [
              ...items,
              {
                productId: targetProductId,
                productVariantId: item.productVariantId,
                name: item.name,
                slug: item.slug,
                size: item.size || "Standard",
                color: cleanColor,
                price: item.price,
                imageUrl: item.imageUrl,
              },
            ],
          });
        }
      },

      removeItem: (id: string, color?: string) => {
        set({
          items: get().items.filter((i) => {
            const matchId =
              i.productId === id ||
              i.productVariantId === id ||
              (i.productId || i.productVariantId) === id;
            if (!matchId) return true;
            if (color !== undefined) {
              return (i.color || undefined) !== (color || undefined);
            }
            return false;
          }),
        });
      },

      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: "rupzon_guest_wishlist",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
