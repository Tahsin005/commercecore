import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, ApiError } from "@/lib/api-client";
import { ApiResponse } from "@/types/api";
import { WishlistItem } from "@/store/useWishlistStore";

export const WISHLIST_QUERY_KEY = ["wishlist"];

export const mapApiWishlistItems = (apiItems: any[]): WishlistItem[] => {
  if (!apiItems || !Array.isArray(apiItems)) return [];
  return apiItems
    .filter((item) => item && item.productId)
    .map((item) => {
      const prod = item.productId;
      return {
        productId: typeof prod === "object" ? prod.id || prod._id : prod,
        name: typeof prod === "object" ? prod.name : "Product",
        slug: typeof prod === "object" ? prod.slug : "product",
        price: typeof prod === "object" ? prod.price || 0 : 0,
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
    { id: string; name: string; slug: string; price: number },
    { previousWishlist: WishlistItem[] | undefined }
  >({
    mutationFn: (product) =>
      apiClient<ApiResponse<{ items: any[] }>>("/wishlist", {
        method: "POST",
        body: JSON.stringify({ productId: product.id }),
      }),
    onMutate: async (product) => {
      await queryClient.cancelQueries({ queryKey: WISHLIST_QUERY_KEY });

      const previousWishlist = queryClient.getQueryData<WishlistItem[]>(WISHLIST_QUERY_KEY) || [];

      const newItem: WishlistItem = {
        productId: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
      };

      if (!previousWishlist.some((i) => i.productId === product.id)) {
        queryClient.setQueryData<WishlistItem[]>(WISHLIST_QUERY_KEY, [
          ...previousWishlist,
          newItem,
        ]);
      }

      return { previousWishlist };
    },
    onError: (_err, _product, context) => {
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
    mutationFn: (productId) =>
      apiClient<ApiResponse<{ items: any[] }>>(`/wishlist/${productId}`, {
        method: "DELETE",
      }),
    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey: WISHLIST_QUERY_KEY });

      const previousWishlist = queryClient.getQueryData<WishlistItem[]>(WISHLIST_QUERY_KEY) || [];

      queryClient.setQueryData<WishlistItem[]>(
        WISHLIST_QUERY_KEY,
        previousWishlist.filter((i) => i.productId !== productId)
      );

      return { previousWishlist };
    },
    onError: (_err, _productId, context) => {
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

  return useMutation<ApiResponse<{ items: any[] }>, ApiError, { productId: string }[]>({
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
