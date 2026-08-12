export interface ApiFieldError {
  field: string;
  message: string;
}

export interface ApiResponse<T = unknown> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
  errors?: ApiFieldError[];
}
