import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, ApiError } from "@/lib/api-client";
import { ApiResponse } from "@/types/api";

export interface ProductVariant {
  id: string;
  label?: string;
  size?: string;
  order?: number;
  isActive?: boolean;
  price?: number;
  overridePrice?: number | null;
  quantity?: number;
}

export interface VariantPayloadItem {
  productVariantId: string;
  price?: number | null;
  quantity: number;
}

export interface Product {
  id: string;
  categoryId?: { id: string; name: string; slug: string; isFeatured?: boolean } | null;
  name: string;
  slug: string;
  code?: string;
  description: string;
  price: number;
  defaultPrice?: number;
  quantity?: number;
  images?: string[];
  isFeatured?: boolean;
  isActive?: boolean;
  variants?: ProductVariant[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductPayload {
  name: string;
  slug?: string;
  code?: string;
  categoryId?: string | null;
  description?: string;
  price: number;
  isFeatured?: boolean;
  isActive?: boolean;
  images?: string[];
  variantIds?: string[];
  variants?: VariantPayloadItem[];
}

export interface UpdateProductPayload {
  id: string;
  name?: string;
  slug?: string;
  code?: string;
  categoryId?: string | null;
  description?: string;
  price?: number;
  isFeatured?: boolean;
  isActive?: boolean;
  images?: string[];
  variantIds?: string[];
  variants?: VariantPayloadItem[];
}

export interface CreateVariantPayload {
  label: string;
  order?: number;
  isActive?: boolean;
}

export interface UpdateVariantPayload {
  id: string;
  label?: string;
  order?: number;
  isActive?: boolean;
}

export interface PaginationInfo {
  totalProducts: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ProductsResponsePayload {
  products: Product[];
  pagination: PaginationInfo;
}

export interface ProductQueryParams {
  categoryId?: string;
  isFeatured?: boolean;
  search?: string;
  minPrice?: number | string;
  maxPrice?: number | string;
  sortBy?: string;
  page?: number;
  limit?: number;
}

export function useProductsQuery(
  paramsOrCategory?: string | ProductQueryParams,
  isFeaturedFlag?: boolean
) {
  const queryParams: ProductQueryParams =
    typeof paramsOrCategory === "string"
      ? { categoryId: paramsOrCategory, isFeatured: isFeaturedFlag }
      : paramsOrCategory || {};

  const { categoryId, isFeatured, search, minPrice, maxPrice, sortBy, page, limit } = queryParams;

  return useQuery<ApiResponse<ProductsResponsePayload>, ApiError>({
    queryKey: [
      "products",
      categoryId || "all",
      isFeatured ? "featured" : "all",
      search || "",
      minPrice !== undefined ? String(minPrice) : "",
      maxPrice !== undefined ? String(maxPrice) : "",
      sortBy || "default",
      page || 1,
      limit || "default",
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (categoryId && categoryId !== "all") params.append("categoryId", categoryId);
      if (isFeatured) params.append("isFeatured", "true");
      if (search && search.trim()) params.append("search", search.trim());
      if (minPrice !== undefined && minPrice !== "") params.append("minPrice", String(minPrice));
      if (maxPrice !== undefined && maxPrice !== "") params.append("maxPrice", String(maxPrice));
      if (sortBy) params.append("sortBy", sortBy);
      if (page) params.append("page", String(page));
      if (limit !== undefined) params.append("limit", String(limit));

      const queryString = params.toString();
      const url = queryString ? `/products?${queryString}` : "/products";
      const rawRes = await apiClient<ApiResponse<ProductsResponsePayload | Product[]>>(url);

      if (Array.isArray(rawRes.data)) {
        const rawArray = rawRes.data;
        return {
          ...rawRes,
          data: {
            products: rawArray,
            pagination: {
              totalProducts: rawArray.length,
              totalPages: 1,
              currentPage: 1,
              limit: rawArray.length,
              hasNextPage: false,
              hasPrevPage: false,
            },
          },
        };
      }

      return rawRes as ApiResponse<ProductsResponsePayload>;
    },
  });
}

export function useInfiniteProductsQuery(
  paramsOrCategory?: string | ProductQueryParams,
  isFeaturedFlag?: boolean
) {
  const queryParams: ProductQueryParams =
    typeof paramsOrCategory === "string"
      ? { categoryId: paramsOrCategory, isFeatured: isFeaturedFlag }
      : paramsOrCategory || {};

  const { categoryId, isFeatured, search, minPrice, maxPrice, sortBy, limit = 8 } = queryParams;

  return useInfiniteQuery<ApiResponse<ProductsResponsePayload>, ApiError>({
    queryKey: [
      "products",
      "infinite",
      categoryId || "all",
      isFeatured ? "featured" : "all",
      search || "",
      minPrice !== undefined ? String(minPrice) : "",
      maxPrice !== undefined ? String(maxPrice) : "",
      sortBy || "default",
      limit,
    ],
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams();
      if (categoryId && categoryId !== "all") params.append("categoryId", categoryId);
      if (isFeatured) params.append("isFeatured", "true");
      if (search && search.trim()) params.append("search", search.trim());
      if (minPrice !== undefined && minPrice !== "") params.append("minPrice", String(minPrice));
      if (maxPrice !== undefined && maxPrice !== "") params.append("maxPrice", String(maxPrice));
      if (sortBy) params.append("sortBy", sortBy);
      params.append("page", String(pageParam));
      params.append("limit", String(limit));

      const queryString = params.toString();
      const url = queryString ? `/products?${queryString}` : "/products";
      const rawRes = await apiClient<ApiResponse<ProductsResponsePayload | Product[]>>(url);

      if (Array.isArray(rawRes.data)) {
        const rawArray = rawRes.data;
        return {
          ...rawRes,
          data: {
            products: rawArray,
            pagination: {
              totalProducts: rawArray.length,
              totalPages: 1,
              currentPage: Number(pageParam),
              limit: rawArray.length,
              hasNextPage: false,
              hasPrevPage: false,
            },
          },
        };
      }

      return rawRes as ApiResponse<ProductsResponsePayload>;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const pagination = lastPage?.data?.pagination;
      if (pagination && pagination.hasNextPage) {
        return pagination.currentPage + 1;
      }
      return undefined;
    },
    enabled: queryParams.search !== undefined ? Boolean(queryParams.search.trim()) : true,
  });
}

export function useGlobalVariantsQuery(includeAll = true) {
  return useQuery<ApiResponse<ProductVariant[]>, ApiError>({
    queryKey: ["global-variants", includeAll ? "all" : "active"],
    queryFn: () => {
      const url = includeAll ? "/products/variants/all?includeAll=true" : "/products/variants/all";
      return apiClient<ApiResponse<ProductVariant[]>>(url);
    },
  });
}

export function useProductDetailsQuery(id: string) {
  return useQuery<ApiResponse<Product>, ApiError>({
    queryKey: ["product", id],
    queryFn: () => apiClient<ApiResponse<Product>>(`/products/${id}`),
    enabled: Boolean(id),
  });
}

export function useProductBySlugQuery(slug: string) {
  return useQuery<ApiResponse<Product>, ApiError>({
    queryKey: ["product", "slug", slug],
    queryFn: () => apiClient<ApiResponse<Product>>(`/products/slug/${slug}`),
    enabled: Boolean(slug),
  });
}

export function useCreateProductMutation() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<Product>, ApiError, CreateProductPayload>({
    mutationFn: (payload) =>
      apiClient<ApiResponse<Product>>("/products", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateProductMutation() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<Product>, ApiError, UpdateProductPayload>({
    mutationFn: ({ id, ...payload }) =>
      apiClient<ApiResponse<Product>>(`/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product"] });
    },
  });
}

export function useDeleteProductMutation() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<Product>, ApiError, string>({
    mutationFn: (id) =>
      apiClient<ApiResponse<Product>>(`/products/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useCreateVariantMutation() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<ProductVariant>, ApiError, CreateVariantPayload>({
    mutationFn: (payload) =>
      apiClient<ApiResponse<ProductVariant>>("/products/variants", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["global-variants"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product"] });
    },
  });
}

export function useUpdateVariantMutation() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<ProductVariant>, ApiError, UpdateVariantPayload>({
    mutationFn: ({ id, ...payload }) =>
      apiClient<ApiResponse<ProductVariant>>(`/products/variants/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["global-variants"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product"] });
    },
  });
}

export function useDeleteVariantMutation() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<ProductVariant>, ApiError, string>({
    mutationFn: (id) =>
      apiClient<ApiResponse<ProductVariant>>(`/products/variants/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["global-variants"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product"] });
    },
  });
}
