import { useMutation } from "@tanstack/react-query";
import { apiClient, ApiError } from "@/lib/api-client";
import { ApiResponse } from "@/types/api";
import { useAuthStore, User } from "@/store/useAuthStore";
import { LoginInput, SignupInput } from "@/lib/validations/auth";

interface AuthResponseData {
  user: User;
  token: string;
}

export function useLoginMutation() {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation<ApiResponse<AuthResponseData>, ApiError, LoginInput>({
    mutationFn: (credentials) =>
      apiClient<ApiResponse<AuthResponseData>>("/users/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      }),
    onSuccess: (response) => {
      if (response.data?.user && response.data?.token) {
        setAuth(response.data.user, response.data.token);
      }
    },
  });
}

export function useSignupMutation() {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation<
    ApiResponse<AuthResponseData>,
    ApiError,
    Omit<SignupInput, "confirmPassword">
  >({
    mutationFn: (userData) =>
      apiClient<ApiResponse<AuthResponseData>>("/users/signup", {
        method: "POST",
        body: JSON.stringify(userData),
      }),
    onSuccess: (response) => {
      if (response.data?.user && response.data?.token) {
        setAuth(response.data.user, response.data.token);
      }
    },
  });
}
