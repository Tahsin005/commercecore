import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, ApiError } from "@/lib/api-client";
import { ApiResponse } from "@/types/api";
import { useAuthStore } from "@/store/useAuthStore";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { CART_QUERY_KEY } from "./useCartQueries";
import { WISHLIST_QUERY_KEY } from "./useWishlistQueries";

export interface OrderItemPayload {
  productId: string;
  productVariantId?: string;
  selectedVariantLabel?: string;
  quantity: number;
}

export interface CreateOrderPayload {
  customerName: string;
  phone: string;
  email?: string;
  shippingAddress: string;
  notes?: string;
  deliveryZone: "inside_dhaka" | "outside_dhaka";
  items: OrderItemPayload[];
  guestCartItems?: OrderItemPayload[];
  guestWishlistItems?: { productId?: string; productVariantId?: string }[];
}

export interface CreateOrderResponseData {
  order: {
    id: string;
    orderNumber: string;
    customerName: string;
    phone: string;
    shippingAddress: string;
    notes?: string;
    deliveryZone: string;
    deliveryCharge: number;
    subtotal: number;
    discountAmount?: number;
    total: number;
    status: string;
  };
  items: any[];
  user: any;
  token: string | null;
}

export function useCreateOrderMutation() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<CreateOrderResponseData>, ApiError, CreateOrderPayload>({
    mutationFn: (orderPayload) =>
      apiClient<ApiResponse<CreateOrderResponseData>>("/orders", {
        method: "POST",
        body: JSON.stringify(orderPayload),
      }),
    onSuccess: async (response) => {
      // Clear local guest cart and wishlist stores
      useCartStore.getState().clearCart();
      useWishlistStore.getState().clearWishlist();

      // Immediately set and invalidate TanStack Query cache for cart, wishlist, and orders
      queryClient.setQueryData(CART_QUERY_KEY, []);
      queryClient.setQueryData(WISHLIST_QUERY_KEY, []);
      await queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
      await queryClient.invalidateQueries({ queryKey: WISHLIST_QUERY_KEY });
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      await queryClient.invalidateQueries({ queryKey: ["customer-orders"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-orders"] });

      if (response.data?.token && response.data?.user) {
        setAuth(response.data.user, response.data.token);
      }
    },
  });
}

export function useOrderDetailsQuery(orderNumber: string) {
  return useQuery<
    ApiResponse<{
      order: CreateOrderResponseData["order"];
      items: any[];
    }>,
    ApiError
  >({
    queryKey: ["order", orderNumber],
    queryFn: () =>
      apiClient<
        ApiResponse<{
          order: CreateOrderResponseData["order"];
          items: any[];
        }>
      >(`/orders/${orderNumber}`),
    enabled: Boolean(orderNumber),
  });
}
