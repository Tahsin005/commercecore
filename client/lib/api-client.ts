import { ApiFieldError, ApiResponse } from "@/types/api";

export type { ApiFieldError, ApiResponse };

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export class ApiError extends Error {
  statusCode: number;
  errors: ApiFieldError[];

  constructor(message: string, statusCode: number, errors: ApiFieldError[] = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.name = "ApiError";
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  let token: string | null = null;
  if (typeof window !== "undefined") {
    try {
      const storedAuth = localStorage.getItem("commercecore_auth_store");
      if (storedAuth) {
        const parsed = JSON.parse(storedAuth);
        token = parsed?.state?.token || null;
      }
    } catch {
      // ignore parsing errors
    }
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    const errorMessage = data.message || `API Error (${response.status})`;
    const fieldErrors = Array.isArray(data.errors) ? data.errors : [];
    throw new ApiError(errorMessage, response.status, fieldErrors);
  }

  return data;
}
