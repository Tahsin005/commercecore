import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, ApiError } from "@/lib/api-client";
import { ApiResponse } from "@/types/api";
import { useAuthStore, User } from "@/store/useAuthStore";

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface OrderItem {
  id?: string;
  name?: string;
  productName?: string;
  size?: string;
  selectedVariantLabel?: string;
  quantity: number;
  price?: number;
  unitPrice?: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  email?: string;
  shippingAddress: string;
  deliveryZone: string;
  status: string;
  subtotal?: number;
  deliveryCharge?: number;
  discount?: number;
  total: number;
  createdAt: string;
  items?: OrderItem[];
}

export interface CustomerOrdersData {
  orders: Order[];
  pagination: PaginationMeta;
}

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
  phone?: string;
}

export interface ChangePasswordPayload {
  currentPassword?: string;
  newPassword: string;
}

export function useMeQuery(enabled = true) {
  return useQuery<ApiResponse<User>, ApiError>({
    queryKey: ["user-me"],
    queryFn: async () => {
      const response = await apiClient<ApiResponse<User>>("/users/me");
      if (response.data) {
        useAuthStore.getState().setAuthUser(response.data);
      }
      return response;
    },
    enabled,
  });
}

export function useCustomerOrdersQuery(page = 1, limit = 10, enabled = true) {
  return useQuery<ApiResponse<CustomerOrdersData>, ApiError>({
    queryKey: ["customer-orders", page, limit],
    queryFn: () => apiClient<ApiResponse<CustomerOrdersData>>(`/orders/my-orders?page=${page}&limit=${limit}`),
    enabled,
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<User>, ApiError, UpdateProfilePayload>({
    mutationFn: (payload) =>
      apiClient<ApiResponse<User>>("/users/profile", {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    onSuccess: (response) => {
      if (response.data) {
        useAuthStore.getState().setAuthUser(response.data);
      }
      queryClient.invalidateQueries({ queryKey: ["user-me"] });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
}

export function useChangePasswordMutation() {
  return useMutation<ApiResponse<any>, ApiError, ChangePasswordPayload>({
    mutationFn: (payload) =>
      apiClient<ApiResponse<any>>("/users/change-password", {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
  });
}


