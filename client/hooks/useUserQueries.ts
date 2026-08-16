import { useQuery } from "@tanstack/react-query";
import { apiClient, ApiError } from "@/lib/api-client";
import { ApiResponse } from "@/types/api";

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  hasPassword?: boolean;
  isAdmin?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminUserStats {
  totalUsers: number;
  registeredUsers: number;
  guestUsers: number;
  adminUsers: number;
}

export interface AdminUsersResponse {
  users: UserAccount[];
  stats: AdminUserStats;
}

export function useAdminUsersQuery() {
  return useQuery<ApiResponse<AdminUsersResponse>, ApiError>({
    queryKey: ["admin-users"],
    queryFn: () => apiClient<ApiResponse<AdminUsersResponse>>("/users/admin"),
  });
}
