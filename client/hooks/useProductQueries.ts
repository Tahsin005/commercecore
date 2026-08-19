import { useQuery, useInfiniteQuery, useMutation, useQueryClient, InfiniteData } from "@tanstack/react-query";
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
  discountPrice?: number | null;
  overrideDiscountPrice?: number | null;
  quantity?: number;
}

export interface VariantPayloadItem {
  productVariantId: string;
  price?: number | null;
  discountPrice?: number | null;
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
  discountPrice?: number | null;
  defaultDiscountPrice?: number | null;
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
  categoryId: string;
  description?: string;
  price: number;
  discountPrice?: number | null;
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
  categoryId?: string;
  description?: string;
  price?: number;
  discountPrice?: number | null;
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
  price?: number | null;
  discountPrice?: number | null;
}

export interface UpdateVariantPayload {
  id: string;
  label?: string;
  order?: number;
  isActive?: boolean;
  price?: number | null;
  discountPrice?: number | null;
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

export function buildProductQueryString(params: ProductQueryParams, pageOverride?: number): string {
  const { categoryId, isFeatured, search, minPrice, maxPrice, sortBy, page, limit } = params;
  const urlParams = new URLSearchParams();
  if (categoryId && categoryId !== "all") urlParams.append("categoryId", categoryId);
  if (isFeatured) urlParams.append("isFeatured", "true");
  if (search && search.trim()) urlParams.append("search", search.trim());
  if (minPrice !== undefined && minPrice !== "") urlParams.append("minPrice", String(minPrice));
  if (maxPrice !== undefined && maxPrice !== "") urlParams.append("maxPrice", String(maxPrice));
  if (sortBy) urlParams.append("sortBy", sortBy);

  const targetPage = pageOverride ?? page;
  if (targetPage) urlParams.append("page", String(targetPage));
  if (limit !== undefined) urlParams.append("limit", String(limit));

  return urlParams.toString();
}

export function normalizeProductsResponse(
  rawRes: ApiResponse<ProductsResponsePayload | Product[]>,
  currentPage = 1
): ApiResponse<ProductsResponsePayload> {
  if (Array.isArray(rawRes.data)) {
    const rawArray = rawRes.data;
    return {
      ...rawRes,
      data: {
        products: rawArray,
        pagination: {
          totalProducts: rawArray.length,
          totalPages: 1,
          currentPage,
          limit: rawArray.length,
          hasNextPage: false,
          hasPrevPage: false,
        },
      },
    };
  }
  return rawRes as ApiResponse<ProductsResponsePayload>;
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
      const queryString = buildProductQueryString(queryParams);
      const url = queryString ? `/products?${queryString}` : "/products";
      const rawRes = await apiClient<ApiResponse<ProductsResponsePayload | Product[]>>(url);
      return normalizeProductsResponse(rawRes, Number(page || 1));
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

  return useInfiniteQuery<
    ApiResponse<ProductsResponsePayload>,
    ApiError,
    InfiniteData<ApiResponse<ProductsResponsePayload>, number>,
    unknown[],
    number
  >({
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
    queryFn: async ({ pageParam }) => {
      const queryString = buildProductQueryString({ ...queryParams, limit }, pageParam);
      const url = queryString ? `/products?${queryString}` : "/products";
      const rawRes = await apiClient<ApiResponse<ProductsResponsePayload | Product[]>>(url);
      return normalizeProductsResponse(rawRes, pageParam);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const pagination = lastPage?.data?.pagination;
      if (!pagination || !pagination.hasNextPage) {
        return undefined;
      }
      const nextPage =
        typeof pagination.currentPage === "number" && pagination.currentPage > 0
          ? pagination.currentPage + 1
          : allPages.length + 1;

      if (pagination.totalPages && nextPage > pagination.totalPages) {
        return undefined;
      }
      return nextPage;
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
