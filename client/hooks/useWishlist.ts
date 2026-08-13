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

  const isInWishlist = (productVariantId: string) => {
    return items.some((item) => item.productVariantId === productVariantId);
  };

  const addToWishlist = async (item: {
    productVariantId: string;
    productId: string;
    name: string;
    slug: string;
    size: string;
    price: number;
  }) => {
    if (isAuthenticated) {
      await addMutation.mutateAsync(item);
    } else {
      addGuestItem(item);
    }
  };

  const removeFromWishlist = async (productVariantId: string) => {
    if (isAuthenticated) {
      await removeMutation.mutateAsync(productVariantId);
    } else {
      removeGuestItem(productVariantId);
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
