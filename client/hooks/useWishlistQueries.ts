import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, ApiError } from "@/lib/api-client";
import { ApiResponse } from "@/types/api";
import { WishlistItem } from "@/store/useWishlistStore";

export const WISHLIST_QUERY_KEY = ["wishlist"];

export const mapApiWishlistItems = (apiItems: any[]): WishlistItem[] => {
  if (!apiItems || !Array.isArray(apiItems)) return [];
  return apiItems
    .filter((item) => item && (item.productId || item.productVariantId))
    .map((item) => {
      const product = item.productId;
      const variant = item.productVariantId;

      const pObj = typeof product === "object" && product ? product : null;
      const vObj = typeof variant === "object" && variant ? variant : null;

      const productId = pObj ? pObj.id || pObj._id : (typeof product === "string" ? product : "");
      const productVariantId = vObj ? vObj.id || vObj._id : (typeof variant === "string" ? variant : undefined);
      const name = pObj ? pObj.name : "Product";
      const slug = pObj ? pObj.slug : "product";
      const size = vObj ? vObj.label || vObj.size || "Standard" : "Standard";
      const price = pObj && pObj.price !== undefined ? pObj.price : (pObj?.defaultPrice || 0);

      return {
        productId,
        productVariantId,
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
    { productId: string; productVariantId?: string; name: string; slug: string; size?: string; price: number },
    { previousWishlist: WishlistItem[] | undefined }
  >({
    mutationFn: (item) =>
      apiClient<ApiResponse<{ items: any[] }>>("/wishlist", {
        method: "POST",
        body: JSON.stringify({ productId: item.productId, productVariantId: item.productVariantId }),
      }),
    onMutate: async (item) => {
      await queryClient.cancelQueries({ queryKey: WISHLIST_QUERY_KEY });

      const previousWishlist = queryClient.getQueryData<WishlistItem[]>(WISHLIST_QUERY_KEY) || [];

      const newItem: WishlistItem = {
        productId: item.productId,
        productVariantId: item.productVariantId,
        name: item.name,
        slug: item.slug,
        size: item.size || "Standard",
        price: item.price,
      };

      if (!previousWishlist.some((i) => i.productId === item.productId)) {
        queryClient.setQueryData<WishlistItem[]>(WISHLIST_QUERY_KEY, [
          ...previousWishlist,
          newItem,
        ]);
      }

      return { previousWishlist };
    },
    onSuccess: (data) => {
      if (data?.data?.items) {
        queryClient.setQueryData<WishlistItem[]>(
          WISHLIST_QUERY_KEY,
          mapApiWishlistItems(data.data.items)
        );
      }
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
    mutationFn: (id) =>
      apiClient<ApiResponse<{ items: any[] }>>(`/wishlist/${id}`, {
        method: "DELETE",
      }),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: WISHLIST_QUERY_KEY });

      const previousWishlist = queryClient.getQueryData<WishlistItem[]>(WISHLIST_QUERY_KEY) || [];

      queryClient.setQueryData<WishlistItem[]>(
        WISHLIST_QUERY_KEY,
        previousWishlist.filter((i) => i.productId !== id && i.productVariantId !== id)
      );

      return { previousWishlist };
    },
    onSuccess: (data) => {
      if (data?.data?.items) {
        queryClient.setQueryData<WishlistItem[]>(
          WISHLIST_QUERY_KEY,
          mapApiWishlistItems(data.data.items)
        );
      }
    },
    onError: (_err, _id, context) => {
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

  return useMutation<ApiResponse<{ items: any[] }>, ApiError, { productId?: string; productVariantId?: string }[]>({
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
