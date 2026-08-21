import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, ApiError } from "@/lib/api-client";
import { ApiResponse } from "@/types/api";

export interface DeliveryChargeSetting {
  insideDhaka: number;
  outsideDhaka: number;
}

export interface MarqueeSetting {
  text: string;
  isActive: boolean;
}

export interface SocialLinkItem {
  icon: string;
  url: string;
  label?: string;
  platform?: string;
}

export interface FooterSettings {
  description: string;
  helpline: string;
  socialLinks: SocialLinkItem[];
}

export interface SiteSettingsMap {
  delivery_charge: DeliveryChargeSetting;
  marquee: MarqueeSetting;
  footer_settings: FooterSettings;
  [key: string]: any;
}

export const SETTINGS_QUERY_KEY = ["site_settings"];

export function useSiteSettingsQuery() {
  return useQuery<SiteSettingsMap, ApiError>({
    queryKey: SETTINGS_QUERY_KEY,
    queryFn: async () => {
      const res = await apiClient<ApiResponse<SiteSettingsMap>>("/settings");
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateSettingMutation() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<SiteSettingsMap>, ApiError, { key: string; value: any }>({
    mutationFn: ({ key, value }) =>
      apiClient<ApiResponse<SiteSettingsMap>>(`/settings/admin/${key}`, {
        method: "PUT",
        body: JSON.stringify({ value }),
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(SETTINGS_QUERY_KEY, data.data);
      queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY });
    },
  });
}
