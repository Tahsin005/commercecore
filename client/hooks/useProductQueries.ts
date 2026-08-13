import { useQuery } from "@tanstack/react-query";
import { apiClient, ApiError } from "@/lib/api-client";
import { ApiResponse } from "@/types/api";

export interface ProductVariant {
  id: string;
  productId: string;
  size: string;
  price: number | null;
  quantity: number;
}

export interface Product {
  id: string;
  categoryId?: { id: string; name: string; slug: string; isFeatured?: boolean } | null;
  name: string;
  slug: string;
  code?: string;
  description: string;
  defaultPrice: number;
  isFeatured?: boolean;
  isActive?: boolean;
  variants?: ProductVariant[];
  createdAt?: string;
}

export function useProductsQuery(categoryId?: string, isFeatured?: boolean) {
  return useQuery<ApiResponse<Product[]>, ApiError>({
    queryKey: ["products", categoryId || "all", isFeatured ? "featured" : "all"],
    queryFn: () => {
      const params = new URLSearchParams();
      if (categoryId) params.append("categoryId", categoryId);
      if (isFeatured) params.append("isFeatured", "true");
      const queryString = params.toString();
      const url = queryString ? `/products?${queryString}` : "/products";
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

export function useProductBySlugQuery(slug: string) {
  return useQuery<ApiResponse<Product>, ApiError>({
    queryKey: ["product", "slug", slug],
    queryFn: () => apiClient<ApiResponse<Product>>(`/products/slug/${slug}`),
    enabled: Boolean(slug),
  });
}
