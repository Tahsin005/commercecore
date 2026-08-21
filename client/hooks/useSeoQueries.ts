import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, ApiError } from "@/lib/api-client";
import { ApiResponse } from "@/types/api";
import { SeoMetaItem } from "@/lib/validations/seo";

export const SEO_KEYS = {
  all: ["seo_all"] as const,
  byRoute: (route: string) => ["seo_route", route] as const,
};

export function usePublicSeoQuery(route: string) {
  const normalizedRoute = route.startsWith("/") ? route.toLowerCase() : `/${route.toLowerCase()}`;
  return useQuery<SeoMetaItem | null, ApiError>({
    queryKey: SEO_KEYS.byRoute(normalizedRoute),
    queryFn: async () => {
      const res = await apiClient<ApiResponse<SeoMetaItem | null>>(
        `/seo?route=${encodeURIComponent(normalizedRoute)}`
      );
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useAdminSeoListQuery() {
  return useQuery<SeoMetaItem[], ApiError>({
    queryKey: SEO_KEYS.all,
    queryFn: async () => {
      const res = await apiClient<ApiResponse<SeoMetaItem[]>>("/seo/admin/all");
      return res.data || [];
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useUpsertSeoMutation() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<SeoMetaItem>, ApiError, Partial<SeoMetaItem>>({
    mutationFn: (data) =>
      apiClient<ApiResponse<SeoMetaItem>>("/seo/admin", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: SEO_KEYS.all });
      if (data.data?.route) {
        queryClient.invalidateQueries({ queryKey: SEO_KEYS.byRoute(data.data.route) });
      }
    },
  });
}

export function useDeleteSeoMutation() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<{ message: string }>, ApiError, string>({
    mutationFn: (id) =>
      apiClient<ApiResponse<{ message: string }>>(`/seo/admin/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SEO_KEYS.all });
    },
  });
}
