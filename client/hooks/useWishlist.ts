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

  const isInWishlist = (id: string, color?: string) => {
    return items.some((item) => {
      const matchId = item.productId === id || item.productVariantId === id;
      if (!matchId) return false;
      if (color !== undefined) {
        return (item.color || undefined) === (color || undefined);
      }
      return true;
    });
  };

  const addToWishlist = async (item: {
    productId: string;
    productVariantId?: string;
    name: string;
    slug: string;
    size?: string;
    color?: string;
    price: number;
    imageUrl?: string;
  }) => {
    if (isAuthenticated) {
      await addMutation.mutateAsync(item);
    } else {
      addGuestItem(item);
    }
  };

  const removeFromWishlist = async (id: string, color?: string) => {
    if (isAuthenticated) {
      await removeMutation.mutateAsync(color ? { id, color } : id);
    } else {
      removeGuestItem(id, color);
    }
  };

  return {
    items,
    isLoading,
    error: serverError,
    wishlistCount: items.length,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
  };
}
