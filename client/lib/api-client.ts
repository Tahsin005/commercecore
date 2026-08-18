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

export function getStoredAuthToken(): string | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem("rupzon_auth_store");
    if (stored) {
      const parsed = JSON.parse(stored);
      const token = parsed?.state?.token;
      if (typeof token === "string" && token.trim().length > 0) {
        return token.trim();
      }
    }
  } catch {
    // ignore
  }

  return null;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const token = getStoredAuthToken();

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
