import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, ApiError } from "@/lib/api-client";
import { ApiResponse } from "@/types/api";

export interface BannerItem {
  id: string;
  imageUrl: string;
  title?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface ContactChannelItem {
  id: string;
  label: string;
  phoneNumber: string;
  type: "call" | "whatsapp" | "bkash" | "nagad";
  sortOrder: number;
  isActive: boolean;
}

export interface ContentBlockItem {
  id: string;
  key: string;
  title: string;
  body: string;
}

export interface ProductInfoBulletItem {
  id: string;
  text: string;
  sortOrder: number;
  isActive: boolean;
  productId?: string | null;
}

// banners hooks
export function useAdminBannersQuery() {
  return useQuery<BannerItem[], ApiError>({
    queryKey: ["cms", "banners"],
    queryFn: async () => {
      const res = await apiClient<ApiResponse<BannerItem[]>>("/cms/admin/banners");
      return res.data;
    },
  });
}

export function useCreateBannerMutation() {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse<BannerItem>, ApiError, Partial<BannerItem>>({
    mutationFn: (data) =>
      apiClient<ApiResponse<BannerItem>>("/cms/admin/banners", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cms", "banners"] });
    },
  });
}

export function useUpdateBannerMutation() {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse<BannerItem>, ApiError, { id: string; data: Partial<BannerItem> }>({
    mutationFn: ({ id, data }) =>
      apiClient<ApiResponse<BannerItem>>(`/cms/admin/banners/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cms", "banners"] });
    },
  });
}

export function useDeleteBannerMutation() {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse<unknown>, ApiError, string>({
    mutationFn: (id) =>
      apiClient<ApiResponse<unknown>>(`/cms/admin/banners/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cms", "banners"] });
    },
  });
}

// contact channels hooks
export function useAdminContactChannelsQuery() {
  return useQuery<ContactChannelItem[], ApiError>({
    queryKey: ["cms", "contactChannels"],
    queryFn: async () => {
      const res = await apiClient<ApiResponse<ContactChannelItem[]>>("/cms/admin/contact-channels");
      return res.data;
    },
  });
}

export function useCreateContactChannelMutation() {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse<ContactChannelItem>, ApiError, Partial<ContactChannelItem>>({
    mutationFn: (data) =>
      apiClient<ApiResponse<ContactChannelItem>>("/cms/admin/contact-channels", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cms", "contactChannels"] });
    },
  });
}

export function useUpdateContactChannelMutation() {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse<ContactChannelItem>, ApiError, { id: string; data: Partial<ContactChannelItem> }>({
    mutationFn: ({ id, data }) =>
      apiClient<ApiResponse<ContactChannelItem>>(`/cms/admin/contact-channels/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cms", "contactChannels"] });
    },
  });
}

export function useDeleteContactChannelMutation() {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse<unknown>, ApiError, string>({
    mutationFn: (id) =>
      apiClient<ApiResponse<unknown>>(`/cms/admin/contact-channels/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cms", "contactChannels"] });
    },
  });
}

// content blocks hooks
export function useContentBlocksQuery() {
  return useQuery<ContentBlockItem[], ApiError>({
    queryKey: ["cms", "contentBlocks"],
    queryFn: async () => {
      const res = await apiClient<ApiResponse<ContentBlockItem[]>>("/cms/admin/content-blocks");
      return res.data;
    },
  });
}

export function useUpsertContentBlockMutation() {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse<ContentBlockItem>, ApiError, { key: string; data: { title: string; body: string } }>({
    mutationFn: ({ key, data }) =>
      apiClient<ApiResponse<ContentBlockItem>>(`/cms/admin/content-blocks/${key}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cms", "contentBlocks"] });
    },
  });
}

export function useDeleteContentBlockMutation() {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse<unknown>, ApiError, string>({
    mutationFn: (key) =>
      apiClient<ApiResponse<unknown>>(`/cms/admin/content-blocks/${key}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cms", "contentBlocks"] });
    },
  });
}

// product info bullets hooks
export function useAdminProductBulletsQuery() {
  return useQuery<ProductInfoBulletItem[], ApiError>({
    queryKey: ["cms", "productBullets"],
    queryFn: async () => {
      const res = await apiClient<ApiResponse<ProductInfoBulletItem[]>>("/cms/admin/info-bullets");
      return res.data;
    },
  });
}

export function useCreateProductBulletMutation() {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse<ProductInfoBulletItem>, ApiError, Partial<ProductInfoBulletItem>>({
    mutationFn: (data) =>
      apiClient<ApiResponse<ProductInfoBulletItem>>("/cms/admin/info-bullets", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cms", "productBullets"] });
    },
  });
}

export function useUpdateProductBulletMutation() {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse<ProductInfoBulletItem>, ApiError, { id: string; data: Partial<ProductInfoBulletItem> }>({
    mutationFn: ({ id, data }) =>
      apiClient<ApiResponse<ProductInfoBulletItem>>(`/cms/admin/info-bullets/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cms", "productBullets"] });
    },
  });
}

export function useDeleteProductBulletMutation() {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse<unknown>, ApiError, string>({
    mutationFn: (id) =>
      apiClient<ApiResponse<unknown>>(`/cms/admin/info-bullets/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cms", "productBullets"] });
    },
  });
}

// Public Banners Query
export function usePublicBannersQuery() {
  return useQuery<BannerItem[], ApiError>({
    queryKey: ["cms", "public-banners"],
    queryFn: async () => {
      const res = await apiClient<ApiResponse<BannerItem[]>>("/cms/banners");
      return res.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Public Contact Channels Query
export function usePublicContactChannelsQuery() {
  return useQuery<ContactChannelItem[], ApiError>({
    queryKey: ["cms", "public-contactChannels"],
    queryFn: async () => {
      const res = await apiClient<ApiResponse<ContactChannelItem[]>>("/cms/contact-channels");
      return res.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Public Content Block by Key Query
export function usePublicContentBlockQuery(key: string) {
  return useQuery<ContentBlockItem, ApiError>({
    queryKey: ["cms", "public-contentBlock", key],
    queryFn: async () => {
      const res = await apiClient<ApiResponse<ContentBlockItem>>(`/cms/content-blocks/${key}`);
      return res.data;
    },
    enabled: Boolean(key),
    staleTime: 5 * 60 * 1000,
  });
}

// Public Product Info Bullets Query
export function usePublicProductBulletsQuery(productId?: string) {
  return useQuery<ProductInfoBulletItem[], ApiError>({
    queryKey: ["cms", "public-productBullets", productId],
    queryFn: async () => {
      const url = productId ? `/cms/info-bullets?productId=${productId}` : "/cms/info-bullets";
      const res = await apiClient<ApiResponse<ProductInfoBulletItem[]>>(url);
      return res.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

