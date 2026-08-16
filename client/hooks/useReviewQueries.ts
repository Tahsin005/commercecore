import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, ApiError } from "@/lib/api-client";
import { ApiResponse } from "@/types/api";
import {
  Review,
  RatingSummary,
  CreateReviewInput,
  ReviewAdminQuery,
  ReviewAdminStats,
} from "@/types/review";

export const REVIEWS_QUERY_KEY = ["reviews"];

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RawProductReviewsResponse {
  success: boolean;
  data: Review[];
  summary: RatingSummary;
  pagination: PaginationMeta;
}

export interface ProductReviewsResponseData {
  reviews: Review[];
  summary: RatingSummary;
  pagination: PaginationMeta;
}

export function useProductReviewsQuery(productId?: string, page = 1) {
  return useQuery<ProductReviewsResponseData, ApiError>({
    queryKey: [...REVIEWS_QUERY_KEY, "product", productId, page],
    queryFn: async () => {
      const res = await apiClient<RawProductReviewsResponse>(`/reviews/product/${productId}?page=${page}`);
      return {
        reviews: res.data || [],
        summary: res.summary || { averageRating: 0, totalReviews: 0, starCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
        pagination: res.pagination || { total: 0, page: 1, limit: 20, totalPages: 0 },
      };
    },
    enabled: Boolean(productId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateReviewMutation() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<Review>, ApiError, CreateReviewInput>({
    mutationFn: (data) =>
      apiClient<ApiResponse<Review>>("/reviews", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [...REVIEWS_QUERY_KEY, "product", variables.productId] });
      queryClient.invalidateQueries({ queryKey: [...REVIEWS_QUERY_KEY, "admin"] });
    },
  });
}

export interface RawAdminReviewsResponse {
  success: boolean;
  data: Review[];
  pagination: PaginationMeta;
  stats: ReviewAdminStats;
}

export interface AdminReviewsResponseData {
  reviews: Review[];
  pagination: PaginationMeta;
  stats: ReviewAdminStats;
}

export function useAdminReviewsQuery(query: ReviewAdminQuery = {}) {
  return useQuery<AdminReviewsResponseData, ApiError>({
    queryKey: [...REVIEWS_QUERY_KEY, "admin", query],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (query.productId) params.append("productId", query.productId);
      if (query.status && query.status !== "ALL") params.append("status", query.status);
      if (query.search?.trim()) params.append("search", query.search.trim());
      if (query.page) params.append("page", query.page.toString());
      if (query.limit) params.append("limit", query.limit.toString());

      const res = await apiClient<RawAdminReviewsResponse>(`/reviews/admin?${params.toString()}`);
      return {
        reviews: res.data || [],
        pagination: res.pagination || { total: 0, page: 1, limit: 20, totalPages: 0 },
        stats: res.stats || { total: 0, pending: 0, approved: 0, rejected: 0 },
      };
    },
    staleTime: 60 * 1000,
  });
}

export function useUpdateReviewStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<Review>, ApiError, { id: string; status: "pending" | "approved" | "rejected" }>({
    mutationFn: ({ id, status }) =>
      apiClient<ApiResponse<Review>>(`/reviews/admin/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REVIEWS_QUERY_KEY });
    },
  });
}

export function useDeleteReviewMutation() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<{ id: string }>, ApiError, string>({
    mutationFn: (id) =>
      apiClient<ApiResponse<{ id: string }>>(`/reviews/admin/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REVIEWS_QUERY_KEY });
    },
  });
}
