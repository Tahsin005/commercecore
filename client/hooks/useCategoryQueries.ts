import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, ApiError } from "@/lib/api-client";
import { ApiResponse } from "@/types/api";

export interface Category {
  id: string;
  name: string;
  slug: string;
  isFeatured?: boolean;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCategoryPayload {
  name: string;
  slug?: string;
  isFeatured?: boolean;
  imageUrl?: string;
}

export interface UpdateCategoryPayload {
  id: string;
  name?: string;
  slug?: string;
  isFeatured?: boolean;
  imageUrl?: string;
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

export function useCreateCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<Category>, ApiError, CreateCategoryPayload>({
    mutationFn: (payload) =>
      apiClient<ApiResponse<Category>>("/categories", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useUpdateCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<Category>, ApiError, UpdateCategoryPayload>({
    mutationFn: ({ id, ...payload }) =>
      apiClient<ApiResponse<Category>>(`/categories/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<Category>, ApiError, string>({
    mutationFn: (id) =>
      apiClient<ApiResponse<Category>>(`/categories/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}
