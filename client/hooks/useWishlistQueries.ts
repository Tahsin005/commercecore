import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, ApiError } from "@/lib/api-client";
import { ApiResponse } from "@/types/api";
import { WishlistItem } from "@/store/useWishlistStore";

export const WISHLIST_QUERY_KEY = ["wishlist"];

export const mapApiWishlistItems = (apiItems: any[]): WishlistItem[] => {
  if (!apiItems || !Array.isArray(apiItems)) return [];
  return apiItems
    .filter((item) => item && item.productVariantId)
    .map((item) => {
      const variant = item.productVariantId;
      const product = typeof variant === "object" && variant ? variant.productId : null;

      const variantId = typeof variant === "object" ? variant.id || variant._id : variant;
      const productId = typeof product === "object" ? product.id || product._id : (variant?.productId || "");
      const name = typeof product === "object" ? product.name : "Product";
      const slug = typeof product === "object" ? product.slug : "product";
      const size = typeof variant === "object" ? variant.size : "Standard";
      const price =
        typeof variant === "object" && variant.price !== null && variant.price !== undefined
          ? variant.price
          : typeof product === "object" ? product.defaultPrice || 0 : 0;

      return {
        productVariantId: variantId,
        productId,
        name,
        slug,
        size,
        price,
      };
    });
};

export function useWishlistQuery(enabled: boolean = true) {
  return useQuery<WishlistItem[], ApiError>({
    queryKey: WISHLIST_QUERY_KEY,
    queryFn: async () => {
      const res = await apiClient<ApiResponse<{ items: any[] }>>("/wishlist");
      return mapApiWishlistItems(res.data?.items || []);
    },
    enabled,
  });
}

export function useAddWishlistMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<{ items: any[] }>,
    ApiError,
    { productVariantId: string; productId: string; name: string; slug: string; size: string; price: number },
    { previousWishlist: WishlistItem[] | undefined }
  >({
    mutationFn: (item) =>
      apiClient<ApiResponse<{ items: any[] }>>("/wishlist", {
        method: "POST",
        body: JSON.stringify({ productVariantId: item.productVariantId }),
      }),
    onMutate: async (item) => {
      await queryClient.cancelQueries({ queryKey: WISHLIST_QUERY_KEY });

      const previousWishlist = queryClient.getQueryData<WishlistItem[]>(WISHLIST_QUERY_KEY) || [];

      const newItem: WishlistItem = {
        productVariantId: item.productVariantId,
        productId: item.productId,
        name: item.name,
        slug: item.slug,
        size: item.size,
        price: item.price,
      };

      if (!previousWishlist.some((i) => i.productVariantId === item.productVariantId)) {
        queryClient.setQueryData<WishlistItem[]>(WISHLIST_QUERY_KEY, [
          ...previousWishlist,
          newItem,
        ]);
      }

      return { previousWishlist };
    },
    onError: (_err, _item, context) => {
      if (context?.previousWishlist) {
        queryClient.setQueryData<WishlistItem[]>(WISHLIST_QUERY_KEY, context.previousWishlist);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: WISHLIST_QUERY_KEY });
    },
  });
}

export function useRemoveWishlistMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<{ items: any[] }>,
    ApiError,
    string,
    { previousWishlist: WishlistItem[] | undefined }
  >({
    mutationFn: (productVariantId) =>
      apiClient<ApiResponse<{ items: any[] }>>(`/wishlist/${productVariantId}`, {
        method: "DELETE",
      }),
    onMutate: async (productVariantId) => {
      await queryClient.cancelQueries({ queryKey: WISHLIST_QUERY_KEY });

      const previousWishlist = queryClient.getQueryData<WishlistItem[]>(WISHLIST_QUERY_KEY) || [];

      queryClient.setQueryData<WishlistItem[]>(
        WISHLIST_QUERY_KEY,
        previousWishlist.filter((i) => i.productVariantId !== productVariantId)
      );

      return { previousWishlist };
    },
    onError: (_err, _productVariantId, context) => {
      if (context?.previousWishlist) {
        queryClient.setQueryData<WishlistItem[]>(WISHLIST_QUERY_KEY, context.previousWishlist);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: WISHLIST_QUERY_KEY });
    },
  });
}

export function useSyncWishlistMutation() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<{ items: any[] }>, ApiError, { productVariantId: string }[]>({
    mutationFn: (items) =>
      apiClient<ApiResponse<{ items: any[] }>>("/wishlist/sync", {
        method: "POST",
        body: JSON.stringify({ items }),
      }),
    onSuccess: (data) => {
      queryClient.setQueryData<WishlistItem[]>(
        WISHLIST_QUERY_KEY,
        mapApiWishlistItems(data.data?.items || [])
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: WISHLIST_QUERY_KEY });
    },
  });
}
