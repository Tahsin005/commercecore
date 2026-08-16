import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, ApiError } from "@/lib/api-client";
import { ApiResponse } from "@/types/api";

export interface Address {
  id: string;
  userId: string;
  label: string;
  fullAddress: string;
  city: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAddressPayload {
  label?: string;
  fullAddress: string;
  city?: string;
  isDefault?: boolean;
}

export interface UpdateAddressPayload {
  label?: string;
  fullAddress?: string;
  city?: string;
  isDefault?: boolean;
}

export function useUserAddressesQuery(enabled = true) {
  return useQuery<ApiResponse<Address[]>, ApiError>({
    queryKey: ["user-addresses"],
    queryFn: () => apiClient<ApiResponse<Address[]>>("/addresses"),
    enabled,
  });
}

export function useCreateAddressMutation() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<Address>, ApiError, CreateAddressPayload>({
    mutationFn: (payload) =>
      apiClient<ApiResponse<Address>>("/addresses", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-addresses"] });
    },
  });
}

export function useUpdateAddressMutation() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<Address>, ApiError, { id: string; payload: UpdateAddressPayload }>({
    mutationFn: ({ id, payload }) =>
      apiClient<ApiResponse<Address>>(`/addresses/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-addresses"] });
    },
  });
}

export function useDeleteAddressMutation() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<null>, ApiError, string>({
    mutationFn: (id) =>
      apiClient<ApiResponse<null>>(`/addresses/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-addresses"] });
    },
  });
}

export function useSetDefaultAddressMutation() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<Address>, ApiError, string>({
    mutationFn: (id) =>
      apiClient<ApiResponse<Address>>(`/addresses/${id}/default`, {
        method: "PATCH",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-addresses"] });
    },
  });
}
