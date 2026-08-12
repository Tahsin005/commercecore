import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient, ApiError } from "@/lib/api-client";
import { ApiResponse } from "@/types/api";
import { useAuthStore } from "@/store/useAuthStore";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";

export interface OrderItemPayload {
  productId: string;
  quantity: number;
}

export interface CreateOrderPayload {
  customerName: string;
  phone: string;
  email?: string;
  shippingAddress: string;
  deliveryZone: "inside_dhaka" | "outside_dhaka";
  items: OrderItemPayload[];
  guestCartItems?: OrderItemPayload[];
  guestWishlistItems?: { productId: string }[];
}

export interface CreateOrderResponseData {
  order: {
    id: string;
    orderNumber: string;
    customerName: string;
    phone: string;
    shippingAddress: string;
    deliveryZone: string;
    deliveryCharge: number;
    subtotal: number;
    total: number;
    status: string;
  };
  items: any[];
  user: any;
  token: string | null;
}

export function useCreateOrderMutation() {
  const setAuth = useAuthStore((state) => state.setAuth);

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
