import { useQuery } from "@tanstack/react-query";
import { apiClient, ApiError } from "@/lib/api-client";
import { ApiResponse } from "@/types/api";

export interface Category {
  id: string;
  name: string;
  slug: string;
  isFeatured?: boolean;
}

export function useCategoriesQuery(isFeatured?: boolean) {
  return useQuery<ApiResponse<Category[]>, ApiError>({
    queryKey: ["categories", isFeatured ? "featured" : "all"],
    queryFn: () => {
      const url = isFeatured ? "/categories?isFeatured=true" : "/categories";
      return apiClient<ApiResponse<Category[]>>(url);
    },
  });
}
