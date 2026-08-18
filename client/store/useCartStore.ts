import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartItem {
  productVariantId?: string;
  productId: string;
  name: string;
  slug: string;
  size: string;
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
      price: number;
      imageUrl?: string;
    },
    quantity?: number
  ) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
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

        const existingIndex = items.findIndex((i) => {
          const iKey = i.productVariantId || i.productId;
          return iKey === pvId || (i.productId === pId && i.productVariantId === item.productVariantId);
        });

        if (existingIndex > -1) {
          const updatedItems = items.map((cartItem, idx) =>
            idx === existingIndex
              ? { ...cartItem, quantity: cartItem.quantity + quantity, imageUrl: item.imageUrl || cartItem.imageUrl }
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
                price: item.price,
                quantity,
                imageUrl: item.imageUrl,
              },
            ],
          });
        }
      },

      removeItem: (id: string) => {
        set({
          items: get().items.filter(
            (i) => i.productVariantId !== id && i.productId !== id && (i.productId || i.productVariantId) !== id
          ),
        });
      },

      updateQuantity: (id: string, quantity: number) => {
        if (quantity <= 0) {
          set({
            items: get().items.filter(
              (i) => i.productVariantId !== id && i.productId !== id && (i.productId || i.productVariantId) !== id
            ),
          });
          return;
        }

        set({
          items: get().items.map((i) =>
            i.productVariantId === id || i.productId === id || (i.productId || i.productVariantId) === id
              ? { ...i, quantity }
              : i
          ),
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
      name: "rupzon_guest_cart",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
