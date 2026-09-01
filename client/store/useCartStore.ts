import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartItem {
  productVariantId?: string;
  productId: string;
  name: string;
  slug: string;
  size: string;
  color?: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface GuestCartState {
  items: CartItem[];
  addItem: (
    item: {
      productVariantId?: string;
      productId: string;
      name: string;
      slug: string;
      size?: string;
      color?: string;
      price: number;
      imageUrl?: string;
    },
    quantity?: number
  ) => void;
  removeItem: (id: string, color?: string) => void;
  updateQuantity: (id: string, quantity: number, color?: string) => void;
  clearCart: () => void;
  getCartSubtotal: () => number;
  getCartCount: () => number;
}

export const useCartStore = create<GuestCartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item, quantity = 1) => {
        const { items } = get();
        const pId = item.productId || item.productVariantId;
        const pvId = item.productVariantId || item.productId;
        if (!pId) return;

        const cleanColor = item.color && item.color.trim() ? item.color.trim() : undefined;

        const existingIndex = items.findIndex((i) => {
          const sameProduct = i.productId === pId;
          const sameVariant = (i.productVariantId || i.productId) === pvId;
          const sameColor = (i.color || undefined) === cleanColor;
          return sameProduct && sameVariant && sameColor;
        });

        if (existingIndex > -1) {
          const updatedItems = items.map((cartItem, idx) =>
            idx === existingIndex
              ? {
                  ...cartItem,
                  quantity: cartItem.quantity + quantity,
                  imageUrl: item.imageUrl || cartItem.imageUrl,
                }
              : cartItem
          );
          set({ items: updatedItems });
        } else {
          set({
            items: [
              ...items,
              {
                productVariantId: pvId,
                productId: pId,
                name: item.name,
                slug: item.slug,
                size: item.size || "Standard",
                color: cleanColor,
                price: item.price,
                quantity,
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
              i.productVariantId === id ||
              i.productId === id ||
              (i.productId || i.productVariantId) === id;
            if (!matchId) return true;
            if (color !== undefined) {
              return (i.color || undefined) !== (color || undefined);
            }
            return false;
          }),
        });
      },

      updateQuantity: (id: string, quantity: number, color?: string) => {
        if (quantity <= 0) {
          get().removeItem(id, color);
          return;
        }

        set({
          items: get().items.map((i) => {
            const matchId =
              i.productVariantId === id ||
              i.productId === id ||
              (i.productId || i.productVariantId) === id;
            const matchColor =
              color !== undefined
                ? (i.color || undefined) === (color || undefined)
                : true;

            if (matchId && matchColor) {
              return { ...i, quantity };
            }
            return i;
          }),
        });
      },

      clearCart: () => set({ items: [] }),

      getCartSubtotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      getCartCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: "commercecore_guest_cart",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
