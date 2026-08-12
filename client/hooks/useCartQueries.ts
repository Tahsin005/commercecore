import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, ApiError } from "@/lib/api-client";
import { ApiResponse } from "@/types/api";
import { CartItem } from "@/store/useCartStore";

export const CART_QUERY_KEY = ["cart"];

export const mapApiCartItems = (apiItems: any[]): CartItem[] => {
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
    { product: { id: string; name: string; slug: string; price: number }; quantity?: number },
    { previousCart: CartItem[] | undefined }
  >({
    mutationFn: ({ product, quantity = 1 }) =>
      apiClient<ApiResponse<{ items: any[] }>>("/cart", {
        method: "POST",
        body: JSON.stringify({ productId: product.id, quantity }),
      }),
    onMutate: async ({ product, quantity = 1 }) => {
      await queryClient.cancelQueries({ queryKey: CART_QUERY_KEY });

      const previousCart = queryClient.getQueryData<CartItem[]>(CART_QUERY_KEY) || [];

      const existingIndex = previousCart.findIndex((i) => i.productId === product.id);
      let newCart: CartItem[];

      if (existingIndex > -1) {
        newCart = previousCart.map((item, idx) =>
          idx === existingIndex ? { ...item, quantity: item.quantity + quantity } : item
        );
      } else {
        newCart = [
          ...previousCart,
          {
            productId: product.id,
            name: product.name,
            slug: product.slug,
            price: product.price,
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
    mutationFn: (productId) =>
      apiClient<ApiResponse<{ items: any[] }>>(`/cart/${productId}`, {
        method: "DELETE",
      }),
    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey: CART_QUERY_KEY });

      const previousCart = queryClient.getQueryData<CartItem[]>(CART_QUERY_KEY) || [];

      queryClient.setQueryData<CartItem[]>(
        CART_QUERY_KEY,
        previousCart.filter((i) => i.productId !== productId)
      );

      return { previousCart };
    },
    onError: (_err, _productId, context) => {
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
    { productId: string; quantity: number },
    { previousCart: CartItem[] | undefined }
  >({
    mutationFn: ({ productId, quantity }) =>
      apiClient<ApiResponse<{ items: any[] }>>("/cart", {
        method: "PUT",
        body: JSON.stringify({ productId, quantity }),
      }),
    onMutate: async ({ productId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: CART_QUERY_KEY });

      const previousCart = queryClient.getQueryData<CartItem[]>(CART_QUERY_KEY) || [];

      let newCart: CartItem[];
      if (quantity <= 0) {
        newCart = previousCart.filter((i) => i.productId !== productId);
      } else {
        newCart = previousCart.map((i) =>
          i.productId === productId ? { ...i, quantity } : i
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

  return useMutation<ApiResponse<{ items: any[] }>, ApiError, { productId: string; quantity: number }[]>({
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
