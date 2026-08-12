import { useAuth } from "./useAuth";
import { useWishlistStore, WishlistItem } from "@/store/useWishlistStore";
import {
  useWishlistQuery,
  useAddWishlistMutation,
  useRemoveWishlistMutation,
} from "./useWishlistQueries";

export function useWishlist() {
  const { isAuthenticated, isHydrated } = useAuth();

  // guest client state from Zustand
  const guestItems = useWishlistStore((state) => state.items);
  const addGuestItem = useWishlistStore((state) => state.addItem);
  const removeGuestItem = useWishlistStore((state) => state.removeItem);
  const clearGuestWishlist = useWishlistStore((state) => state.clearWishlist);

  // authenticated server state from TanStack Query
  const {
    data: serverItems,
    isLoading: isServerLoading,
    error: serverError,
  } = useWishlistQuery(isHydrated && isAuthenticated);

  const addMutation = useAddWishlistMutation();
  const removeMutation = useRemoveWishlistMutation();

  const items: WishlistItem[] = isAuthenticated ? serverItems || [] : guestItems;
  const isLoading = isAuthenticated ? isServerLoading : !isHydrated;

  const isInWishlist = (productId: string) => {
    return items.some((i) => i.productId === productId);
  };

  const addToWishlist = async (product: { id: string; name: string; slug: string; price: number }) => {
    if (isAuthenticated) {
      await addMutation.mutateAsync(product);
    } else {
      addGuestItem(product);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (isAuthenticated) {
      await removeMutation.mutateAsync(productId);
    } else {
      removeGuestItem(productId);
    }
  };

  return {
    items,
    isLoading,
    error: serverError,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist: clearGuestWishlist,
  };
}
