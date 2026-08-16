import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface WishlistItem {
  productId: string;
  productVariantId?: string;
  name: string;
  slug: string;
  size?: string;
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
    price: number;
    imageUrl?: string;
  }) => void;
  removeItem: (id: string) => void;
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

        const exists = items.some((i) => {
          const iProdId = i.productId || i.productVariantId;
          const iVarId = i.productVariantId;

          return (
            (iProdId && iProdId === targetProductId) ||
            (iVarId && item.productVariantId && iVarId === item.productVariantId)
          );
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
                price: item.price,
                imageUrl: item.imageUrl,
              },
            ],
          });
        }
      },

      removeItem: (id: string) => {
        set({
          items: get().items.filter(
            (i) => i.productId !== id && i.productVariantId !== id && (i.productId || i.productVariantId) !== id
          ),
        });
      },

      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: "commercecore_guest_wishlist",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
