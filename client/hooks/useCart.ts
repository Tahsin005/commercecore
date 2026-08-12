import { useAuth } from "./useAuth";
import { useCartStore, CartItem } from "@/store/useCartStore";
import {
  useCartQuery,
  useAddToCartMutation,
  useRemoveFromCartMutation,
  useUpdateCartQuantityMutation,
  useClearCartMutation,
} from "./useCartQueries";

export function useCart() {
  const { isAuthenticated, isHydrated } = useAuth();

  // guest client state from Zustand
  const guestItems = useCartStore((state) => state.items);
  const addGuestItem = useCartStore((state) => state.addItem);
  const removeGuestItem = useCartStore((state) => state.removeItem);
  const updateGuestQuantity = useCartStore((state) => state.updateQuantity);
  const clearGuestCart = useCartStore((state) => state.clearCart);

  // authenticated server state from TanStack Query
  const {
    data: serverItems,
    isLoading: isServerLoading,
    error: serverError,
  } = useCartQuery(isHydrated && isAuthenticated);

  const addMutation = useAddToCartMutation();
  const removeMutation = useRemoveFromCartMutation();
  const updateQtyMutation = useUpdateCartQuantityMutation();
  const clearMutation = useClearCartMutation();

  const items: CartItem[] = isAuthenticated ? serverItems || [] : guestItems;
  const isLoading = isAuthenticated ? isServerLoading : !isHydrated;

  const getCartSubtotal = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  const addItem = async (
    product: { id: string; name: string; slug: string; price: number },
    quantity = 1
  ) => {
    if (isAuthenticated) {
      await addMutation.mutateAsync({ product, quantity });
    } else {
      addGuestItem(product, quantity);
    }
  };

  const removeItem = async (productId: string) => {
    if (isAuthenticated) {
      await removeMutation.mutateAsync(productId);
    } else {
      removeGuestItem(productId);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (isAuthenticated) {
      if (quantity <= 0) {
        await removeMutation.mutateAsync(productId);
      } else {
        await updateQtyMutation.mutateAsync({ productId, quantity });
      }
    } else {
      updateGuestQuantity(productId, quantity);
    }
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      await clearMutation.mutateAsync();
    } else {
      clearGuestCart();
    }
  };

  return {
    items,
    isLoading,
    error: serverError,
    subtotal: getCartSubtotal(),
    cartCount: getCartCount(),
    getCartSubtotal,
    getCartCount,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  };
}
