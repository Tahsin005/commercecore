import { useMutation } from "@tanstack/react-query";
import { ApiError, getStoredAuthToken } from "@/lib/api-client";
import { ApiResponse } from "@/types/api";

export interface UploadImageResponse {
  url: string;
  publicId: string;
  configName: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export function useUploadImageMutation() {
  return useMutation<ApiResponse<UploadImageResponse>, ApiError, File>({
    mutationFn: async (file: File) => {
      const token = getStoredAuthToken();

      const formData = new FormData();
      formData.append("image", file);

      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/upload-configs/image`, {
        method: "POST",
        headers,
        body: formData,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.success === false) {
        throw new ApiError(data.message || "Failed to upload image", response.status, data.errors || []);
      }

      return data;
    },
  });
}
