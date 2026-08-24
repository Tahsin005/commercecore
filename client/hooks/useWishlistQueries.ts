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
      const color = item.color || undefined;

      const rawImages = pObj?.images || vObj?.productId?.images;
      const rawColors = pObj?.colors || vObj?.productId?.colors;

      let imageUrl = item.imageUrl;
      if (!imageUrl && rawImages && Array.isArray(rawImages) && rawImages.length > 0) {
        if (color && Array.isArray(rawColors)) {
          const colorIdx = rawColors.findIndex((c: string) => c && c.toLowerCase() === color.toLowerCase());
          imageUrl = colorIdx !== -1 && rawImages[colorIdx] ? rawImages[colorIdx] : rawImages[0];
        } else {
          imageUrl = rawImages[0];
        }
      }
      if (!imageUrl) {
        imageUrl = pObj?.imageUrl || vObj?.productId?.imageUrl || undefined;
      }

      return {
        productId,
        productVariantId: productVariantId || productId,
        name,
        slug,
        size,
        color,
        price,
        imageUrl,
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
    {
      productId: string;
      productVariantId?: string;
      name: string;
      slug: string;
      size?: string;
      color?: string;
      price: number;
      imageUrl?: string;
    },
    { previousWishlist: WishlistItem[] | undefined }
  >({
    mutationFn: (item) =>
      apiClient<ApiResponse<{ items: any[] }>>("/wishlist", {
        method: "POST",
        body: JSON.stringify({
          productId: item.productId,
          productVariantId: item.productVariantId,
          color: item.color,
        }),
      }),
    onMutate: async (item) => {
      await queryClient.cancelQueries({ queryKey: WISHLIST_QUERY_KEY });

      const previousWishlist = queryClient.getQueryData<WishlistItem[]>(WISHLIST_QUERY_KEY) || [];
      const cleanColor = item.color && item.color.trim() ? item.color.trim() : undefined;

      const newItem: WishlistItem = {
        productId: item.productId,
        productVariantId: item.productVariantId,
        name: item.name,
        slug: item.slug,
        size: item.size || "Standard",
        color: cleanColor,
        price: item.price,
        imageUrl: item.imageUrl,
      };

      const exists = previousWishlist.some(
        (i) =>
          (i.productId === item.productId || i.productVariantId === item.productId) &&
          (i.color || undefined) === cleanColor
      );

      if (!exists) {
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
    string | { id: string; color?: string },
    { previousWishlist: WishlistItem[] | undefined }
  >({
    mutationFn: (target) => {
      const id = typeof target === "string" ? target : target.id;
      const color = typeof target === "object" ? target.color : undefined;
      const url = color ? `/wishlist/${id}?color=${encodeURIComponent(color)}` : `/wishlist/${id}`;
      return apiClient<ApiResponse<{ items: any[] }>>(url, {
        method: "DELETE",
      });
    },
    onMutate: async (target) => {
      await queryClient.cancelQueries({ queryKey: WISHLIST_QUERY_KEY });

      const previousWishlist = queryClient.getQueryData<WishlistItem[]>(WISHLIST_QUERY_KEY) || [];
      const id = typeof target === "string" ? target : target.id;
      const color = typeof target === "object" ? target.color : undefined;

      queryClient.setQueryData<WishlistItem[]>(
        WISHLIST_QUERY_KEY,
        previousWishlist.filter((i) => {
          const matchId = i.productId === id || i.productVariantId === id;
          if (!matchId) return true;
          if (color !== undefined) {
            return (i.color || undefined) !== (color || undefined);
          }
          return false;
        })
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

  return useMutation<
    ApiResponse<{ items: any[] }>,
    ApiError,
    { productId?: string; productVariantId?: string; color?: string }[]
  >({
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
