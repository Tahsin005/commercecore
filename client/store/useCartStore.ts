import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartItem {
  productVariantId: string;
  productId: string;
  name: string;
  slug: string;
  size: string;
  price: number;
  quantity: number;
}

interface GuestCartState {
  items: CartItem[];
  addItem: (
    item: {
      productVariantId: string;
      productId: string;
      name: string;
      slug: string;
      size: string;
      price: number;
    },
    quantity?: number
  ) => void;
  removeItem: (productVariantId: string) => void;
  updateQuantity: (productVariantId: string, quantity: number) => void;
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
        const existingIndex = items.findIndex(
          (i) => i.productVariantId === item.productVariantId
        );

        if (existingIndex > -1) {
          const updatedItems = items.map((cartItem, idx) =>
            idx === existingIndex
              ? { ...cartItem, quantity: cartItem.quantity + quantity }
              : cartItem
          );
          set({ items: updatedItems });
        } else {
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
                quantity,
              },
            ],
          });
        }
      },

      removeItem: (productVariantId: string) => {
        set({ items: get().items.filter((i) => i.productVariantId !== productVariantId) });
      },

      updateQuantity: (productVariantId: string, quantity: number) => {
        if (quantity <= 0) {
          set({ items: get().items.filter((i) => i.productVariantId !== productVariantId) });
          return;
        }

        set({
          items: get().items.map((i) =>
            i.productVariantId === productVariantId ? { ...i, quantity } : i
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
      name: "commercecore_guest_cart",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
