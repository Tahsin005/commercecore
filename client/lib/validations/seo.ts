import { z } from "zod";

export const seoMetaFormSchema = z.object({
  route: z.string().trim().min(1, "Route path is required"),
  title: z.string().trim().max(100, "Title should ideally be under 70 characters").optional(),
  description: z.string().trim().max(300, "Description should ideally be under 160 characters").optional(),
  ogTitle: z.string().trim().optional(),
  ogDescription: z.string().trim().optional(),
  ogImage: z.string().trim().optional(),
  canonicalUrl: z.string().trim().optional(),
  keywords: z.string().optional(),
  noIndex: z.boolean().optional(),
});

export type SeoMetaFormInput = z.infer<typeof seoMetaFormSchema>;

export interface SeoMetaItem {
  id?: string;
  route: string;
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  keywords?: string[];
  noIndex?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
