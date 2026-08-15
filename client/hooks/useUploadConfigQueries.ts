import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, ApiError } from "@/lib/api-client";
import { ApiResponse } from "@/types/api";

export interface UploadConfig {
  id: string;
  name: string;
  uploadUrl: string;
  load: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UploadConfigStats {
  totalConfigs: number;
  activeConfigs: number;
  totalLoad: number;
}

export interface UploadConfigsResponse {
  configs: UploadConfig[];
  stats: UploadConfigStats;
}

export interface CreateUploadConfigPayload {
  name?: string;
  uploadUrl: string;
  isActive?: boolean;
}

export interface UpdateUploadConfigPayload {
  name?: string;
  uploadUrl?: string;
  load?: number;
  isActive?: boolean;
}

export const UPLOAD_CONFIGS_QUERY_KEY = ["upload-configs"];

export function useUploadConfigsQuery() {
  return useQuery<ApiResponse<UploadConfigsResponse>, ApiError>({
    queryKey: UPLOAD_CONFIGS_QUERY_KEY,
    queryFn: () => apiClient<ApiResponse<UploadConfigsResponse>>("/upload-configs"),
  });
}

export function useCreateUploadConfigMutation() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<UploadConfig>, ApiError, CreateUploadConfigPayload>({
    mutationFn: (data) =>
      apiClient<ApiResponse<UploadConfig>>("/upload-configs", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: UPLOAD_CONFIGS_QUERY_KEY });
    },
  });
}

export function useUpdateUploadConfigMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<UploadConfig>,
    ApiError,
    { id: string; payload: UpdateUploadConfigPayload }
  >({
    mutationFn: ({ id, payload }) =>
      apiClient<ApiResponse<UploadConfig>>(`/upload-configs/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: UPLOAD_CONFIGS_QUERY_KEY });
    },
  });
}

export function useDeleteUploadConfigMutation() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<UploadConfig>, ApiError, string>({
    mutationFn: (id) =>
      apiClient<ApiResponse<UploadConfig>>(`/upload-configs/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: UPLOAD_CONFIGS_QUERY_KEY });
    },
  });
}
