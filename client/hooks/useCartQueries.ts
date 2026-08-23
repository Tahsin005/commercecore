import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, ApiError } from "@/lib/api-client";
import { ApiResponse } from "@/types/api";
import { CartItem } from "@/store/useCartStore";

export const CART_QUERY_KEY = ["cart"];

export const mapApiCartItems = (apiItems: any[]): CartItem[] => {
  if (!apiItems || !Array.isArray(apiItems)) return [];
  const mappedList: CartItem[] = [];

  for (const item of apiItems) {
    if (!item || (!item.productId && !item.productVariantId)) continue;
    const product = item.productId;
    const variant = item.productVariantId;
    
    const pObj = typeof product === "object" && product ? product : null;
    const vObj = typeof variant === "object" && variant ? variant : null;

    const productId = pObj ? (pObj.id || pObj._id || "").toString() : (typeof product === "string" ? product : "");
    
    let rawVariantId: string | undefined = undefined;
    if (vObj) {
      if (typeof vObj.id === "string") {
        rawVariantId = vObj.id;
      } else if (typeof vObj._id === "string") {
        rawVariantId = vObj._id;
      }
    } else if (typeof variant === "string") {
      rawVariantId = variant;
    }

    const realVariantId = (rawVariantId && rawVariantId !== productId) ? rawVariantId : undefined;
    const name = pObj ? pObj.name : "Product";
    const slug = pObj ? pObj.slug : "product";
    const size = vObj ? (vObj.label || vObj.size || "Standard") : "Standard";
    const price = pObj && pObj.price !== undefined ? pObj.price : (pObj?.defaultPrice || 0);
    const rawImages = pObj?.images || vObj?.productId?.images;
    const imageUrl = (rawImages && Array.isArray(rawImages) && rawImages.length > 0)
      ? rawImages[0]
      : (pObj?.imageUrl || vObj?.productId?.imageUrl || item.imageUrl || undefined);

    const variantKey = realVariantId || productId;
    const existingIndex = mappedList.findIndex(
      (m) => m.productId === productId && (m.productVariantId || m.productId) === variantKey
    );

    if (existingIndex > -1) {
      mappedList[existingIndex].quantity += (item.quantity || 1);
    } else {
      mappedList.push({
        productVariantId: variantKey,
        productId,
        name,
        slug,
        size,
        price,
        quantity: item.quantity || 1,
        imageUrl,
      });
    }
  }

  return mappedList;
};

export function useCartQuery(enabled: boolean = true) {
  return useQuery<CartItem[], ApiError>({
    queryKey: CART_QUERY_KEY,
    queryFn: async () => {
      const res = await apiClient<ApiResponse<{ items: any[] }>>("/cart");
      return mapApiCartItems(res.data?.items || []);
    },
    enabled,
  });
}

export function useAddToCartMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<{ items: any[] }>,
    ApiError,
    { item: { productVariantId?: string; productId: string; name: string; slug: string; size?: string; price: number }; quantity?: number },
    { previousCart: CartItem[] | undefined }
  >({
    mutationFn: ({ item, quantity = 1 }) =>
      apiClient<ApiResponse<{ items: any[] }>>("/cart", {
        method: "POST",
        body: JSON.stringify({ productId: item.productId, productVariantId: item.productVariantId, quantity }),
      }),
    onMutate: async ({ item, quantity = 1 }) => {
      await queryClient.cancelQueries({ queryKey: CART_QUERY_KEY });

      const previousCart = queryClient.getQueryData<CartItem[]>(CART_QUERY_KEY) || [];
      const itemKey = item.productVariantId || item.productId;

      const existingIndex = previousCart.findIndex((i) => (i.productVariantId || i.productId) === itemKey);
      let newCart: CartItem[];

      if (existingIndex > -1) {
        newCart = previousCart.map((cartItem, idx) =>
          idx === existingIndex ? { ...cartItem, quantity: cartItem.quantity + quantity } : cartItem
        );
      } else {
        newCart = [
          ...previousCart,
          {
            productVariantId: itemKey,
            productId: item.productId,
            name: item.name,
            slug: item.slug,
            size: item.size || "Standard",
            price: item.price,
            quantity,
          },
        ];
      }

      queryClient.setQueryData<CartItem[]>(CART_QUERY_KEY, newCart);

      return { previousCart };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData<CartItem[]>(CART_QUERY_KEY, context.previousCart);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
}

export function useRemoveFromCartMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<{ items: any[] }>,
    ApiError,
    string,
    { previousCart: CartItem[] | undefined }
  >({
    mutationFn: (id) =>
      apiClient<ApiResponse<{ items: any[] }>>(`/cart/${id}`, {
        method: "DELETE",
      }),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: CART_QUERY_KEY });

      const previousCart = queryClient.getQueryData<CartItem[]>(CART_QUERY_KEY) || [];

      queryClient.setQueryData<CartItem[]>(
        CART_QUERY_KEY,
        previousCart.filter((i) => i.productVariantId !== id && i.productId !== id)
      );

      return { previousCart };
    },
    onError: (_err, _id, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData<CartItem[]>(CART_QUERY_KEY, context.previousCart);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
}

export function useUpdateCartQuantityMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<{ items: any[] }>,
    ApiError,
    { productVariantId: string; quantity: number },
    { previousCart: CartItem[] | undefined }
  >({
    mutationFn: ({ productVariantId, quantity }) =>
      apiClient<ApiResponse<{ items: any[] }>>("/cart", {
        method: "PUT",
        body: JSON.stringify({ id: productVariantId, productVariantId, quantity }),
      }),
    onMutate: async ({ productVariantId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: CART_QUERY_KEY });

      const previousCart = queryClient.getQueryData<CartItem[]>(CART_QUERY_KEY) || [];

      let newCart: CartItem[];
      if (quantity <= 0) {
        newCart = previousCart.filter((i) => i.productVariantId !== productVariantId && i.productId !== productVariantId);
      } else {
        newCart = previousCart.map((i) =>
          i.productVariantId === productVariantId || i.productId === productVariantId ? { ...i, quantity } : i
        );
      }

      queryClient.setQueryData<CartItem[]>(CART_QUERY_KEY, newCart);

      return { previousCart };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData<CartItem[]>(CART_QUERY_KEY, context.previousCart);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
}

export function useClearCartMutation() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<any>, ApiError, void, { previousCart: CartItem[] | undefined }>({
    mutationFn: () =>
      apiClient<ApiResponse<any>>("/cart", {
        method: "DELETE",
      }),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: CART_QUERY_KEY });
      const previousCart = queryClient.getQueryData<CartItem[]>(CART_QUERY_KEY) || [];
      queryClient.setQueryData<CartItem[]>(CART_QUERY_KEY, []);
      return { previousCart };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData<CartItem[]>(CART_QUERY_KEY, context.previousCart);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
}

export function useSyncCartMutation() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<{ items: any[] }>, ApiError, { productId?: string; productVariantId?: string; quantity: number }[]>({
    mutationFn: (items) =>
      apiClient<ApiResponse<{ items: any[] }>>("/cart/sync", {
        method: "POST",
        body: JSON.stringify({ items }),
      }),
    onSuccess: (data) => {
      queryClient.setQueryData<CartItem[]>(
        CART_QUERY_KEY,
        mapApiCartItems(data.data?.items || [])
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
}
