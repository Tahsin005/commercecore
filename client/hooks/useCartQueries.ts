import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, ApiError } from "@/lib/api-client";
import { ApiResponse } from "@/types/api";
import { CartItem } from "@/store/useCartStore";

export const CART_QUERY_KEY = ["cart"];

export const mapApiCartItems = (apiItems: any[]): CartItem[] => {
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
        quantity: item.quantity || 1,
      };
    });
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
    { item: { productVariantId: string; productId: string; name: string; slug: string; size: string; price: number }; quantity?: number },
    { previousCart: CartItem[] | undefined }
  >({
    mutationFn: ({ item, quantity = 1 }) =>
      apiClient<ApiResponse<{ items: any[] }>>("/cart", {
        method: "POST",
        body: JSON.stringify({ productVariantId: item.productVariantId, quantity }),
      }),
    onMutate: async ({ item, quantity = 1 }) => {
      await queryClient.cancelQueries({ queryKey: CART_QUERY_KEY });

      const previousCart = queryClient.getQueryData<CartItem[]>(CART_QUERY_KEY) || [];

      const existingIndex = previousCart.findIndex((i) => i.productVariantId === item.productVariantId);
      let newCart: CartItem[];

      if (existingIndex > -1) {
        newCart = previousCart.map((cartItem, idx) =>
          idx === existingIndex ? { ...cartItem, quantity: cartItem.quantity + quantity } : cartItem
        );
      } else {
        newCart = [
          ...previousCart,
          {
            productVariantId: item.productVariantId,
            productId: item.productId,
            name: item.name,
            slug: item.slug,
            size: item.size,
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
    mutationFn: (productVariantId) =>
      apiClient<ApiResponse<{ items: any[] }>>(`/cart/${productVariantId}`, {
        method: "DELETE",
      }),
    onMutate: async (productVariantId) => {
      await queryClient.cancelQueries({ queryKey: CART_QUERY_KEY });

      const previousCart = queryClient.getQueryData<CartItem[]>(CART_QUERY_KEY) || [];

      queryClient.setQueryData<CartItem[]>(
        CART_QUERY_KEY,
        previousCart.filter((i) => i.productVariantId !== productVariantId)
      );

      return { previousCart };
    },
    onError: (_err, _productVariantId, context) => {
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
        body: JSON.stringify({ productVariantId, quantity }),
      }),
    onMutate: async ({ productVariantId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: CART_QUERY_KEY });

      const previousCart = queryClient.getQueryData<CartItem[]>(CART_QUERY_KEY) || [];

      let newCart: CartItem[];
      if (quantity <= 0) {
        newCart = previousCart.filter((i) => i.productVariantId !== productVariantId);
      } else {
        newCart = previousCart.map((i) =>
          i.productVariantId === productVariantId ? { ...i, quantity } : i
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

  return useMutation<ApiResponse<{ items: any[] }>, ApiError, { productVariantId: string; quantity: number }[]>({
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
