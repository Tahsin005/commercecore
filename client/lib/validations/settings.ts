import { z } from "zod";

export const deliveryChargeSchema = z.object({
  insideDhaka: z.number().min(0, "Inside Dhaka charge must be 0 or greater"),
  outsideDhaka: z.number().min(0, "Outside Dhaka charge must be 0 or greater"),
});

export const siteDiscountSchema = z.object({
  discountPercentage: z.number().min(0, "Min 0%").max(100, "Max 100%"),
  isActive: z.boolean(),
});

export const marqueeSchema = z.object({
  text: z.string().trim().min(1, "Marquee text is required"),
  isActive: z.boolean(),
});

export const footerSettingsSchema = z.object({
  description: z.string().trim().optional(),
  helpline: z.string().trim().optional(),
});

export const bannerFormSchema = z.object({
  imageUrl: z.string().trim().min(1, "Banner image is required"),
  title: z.string().trim().optional(),
  sortOrder: z.number().int().min(0),
});

export const contactChannelFormSchema = z.object({
  label: z.string().trim().min(1, "Label is required"),
  phoneNumber: z.string().trim().min(1, "Phone number is required"),
  type: z.enum(["call", "whatsapp", "bkash", "nagad"]),
  sortOrder: z.number().int().min(0),
});

export const contentBlockFormSchema = z.object({
  key: z.string().trim().min(1),
  title: z.string().trim().min(1, "Title is required"),
  body: z.string().trim().min(1, "Content body is required"),
});

export const productBulletFormSchema = z.object({
  text: z.string().trim().min(1, "Bullet text is required"),
  sortOrder: z.number().int().min(0),
});

export type DeliveryChargeInput = z.infer<typeof deliveryChargeSchema>;
export type SiteDiscountInput = z.infer<typeof siteDiscountSchema>;
export type MarqueeInput = z.infer<typeof marqueeSchema>;
export type FooterSettingsInput = z.infer<typeof footerSettingsSchema>;
export type BannerFormInput = z.infer<typeof bannerFormSchema>;
export type ContactChannelFormInput = z.infer<typeof contactChannelFormSchema>;
export type ContentBlockFormInput = z.infer<typeof contentBlockFormSchema>;
export type ProductBulletFormInput = z.infer<typeof productBulletFormSchema>;
