import { useQuery } from "@tanstack/react-query";
import { apiClient, ApiError } from "@/lib/api-client";
import { ApiResponse } from "@/types/api";
import { Product } from "@/app/page";

export function useProductsQuery(categoryId?: string) {
  return useQuery<ApiResponse<Product[]>, ApiError>({
    queryKey: ["products", categoryId || "all"],
    queryFn: () => {
      const url = categoryId ? `/products?categoryId=${categoryId}` : "/products";
      return apiClient<ApiResponse<Product[]>>(url);
    },
  });
}

export function useProductDetailsQuery(id: string) {
  return useQuery<ApiResponse<Product>, ApiError>({
    queryKey: ["product", id],
    queryFn: () => apiClient<ApiResponse<Product>>(`/products/${id}`),
    enabled: Boolean(id),
  });
}
