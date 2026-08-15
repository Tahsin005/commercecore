import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { apiClient, ApiError } from "@/lib/api-client";
import { ApiResponse } from "@/types/api";

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURNED";

export interface AdminOrderItem {
  id: string;
  orderId: string;
  productId: {
    id: string;
    name: string;
    slug: string;
    code?: string;
    price: number;
  } | null;
  productVariantId?: {
    id: string;
    label: string;
  } | null;
  productName: string;
  selectedVariantLabel: string;
  size: string;
  unitPrice: number;
  quantity: number;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  userId?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  } | null;
  customerName: string;
  phone: string;
  email: string;
  shippingAddress: string;
  deliveryZone: "inside_dhaka" | "outside_dhaka";
  deliveryCharge: number;
  subtotal: number;
  discountAmount: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  items?: AdminOrderItem[];
}

export interface AdminOrderStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
}

export interface AdminOrdersResponse {
  orders: AdminOrder[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  stats: AdminOrderStats;
}

export interface AdminOrderFilters {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const ADMIN_ORDERS_QUERY_KEY = ["admin-orders"];

export function useAdminOrdersQuery(filters: AdminOrderFilters = {}) {
  const queryParams = new URLSearchParams();
  if (filters.status && filters.status !== "ALL") queryParams.append("status", filters.status);
  if (filters.search && filters.search.trim()) queryParams.append("search", filters.search.trim());
  if (filters.page) queryParams.append("page", filters.page.toString());
  if (filters.limit) queryParams.append("limit", filters.limit.toString());

  const queryString = queryParams.toString();
  const endpoint = `/orders/admin${queryString ? `?${queryString}` : ""}`;

  return useQuery<ApiResponse<AdminOrdersResponse>, ApiError>({
    queryKey: [...ADMIN_ORDERS_QUERY_KEY, filters],
    queryFn: () => apiClient<ApiResponse<AdminOrdersResponse>>(endpoint),
    placeholderData: keepPreviousData,
  });
}

export function useAdminOrderDetailQuery(orderId: string | null) {
  return useQuery<ApiResponse<{ order: AdminOrder; items: AdminOrderItem[] }>, ApiError>({
    queryKey: [...ADMIN_ORDERS_QUERY_KEY, "detail", orderId],
    queryFn: () => apiClient<ApiResponse<{ order: AdminOrder; items: AdminOrderItem[] }>>(`/orders/admin/${orderId}`),
    enabled: Boolean(orderId),
  });
}

export function useUpdateOrderStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<{ order: AdminOrder; items: AdminOrderItem[] }>,
    ApiError,
    { id: string; status: OrderStatus }
  >({
    mutationFn: ({ id, status }) =>
      apiClient<ApiResponse<{ order: AdminOrder; items: AdminOrderItem[] }>>(`/orders/admin/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_ORDERS_QUERY_KEY });
    },
  });
}
