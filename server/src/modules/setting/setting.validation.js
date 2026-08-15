import { z } from 'zod';

export const deliveryChargeSchema = z.object({
  insideDhaka: z.number().min(0, 'Inside Dhaka delivery charge must be at least 0'),
  outsideDhaka: z.number().min(0, 'Outside Dhaka delivery charge must be at least 0'),
});

export const siteDiscountSchema = z.object({
  discountPercentage: z.number().min(0).max(100, 'Discount percentage must be between 0 and 100'),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  isActive: z.boolean(),
});

export const marqueeSchema = z.object({
  text: z.string().trim().min(1, 'Marquee text is required'),
  isActive: z.boolean(),
});

export const footerSettingsSchema = z.object({
  description: z.string().trim().optional(),
  helpline: z.string().trim().optional(),
  socialLinks: z
    .array(
      z.object({
        platform: z.string().trim().min(1, 'Platform name is required'),
        url: z.string().trim().url('Must be a valid URL'),
      })
    )
    .optional(),
});

export const updateSettingSchema = z.object({
  params: z.object({
    key: z.enum(['delivery_charge', 'site_discount', 'marquee', 'footer_settings']),
  }),
  body: z.object({
    value: z.unknown(),
  }),
});
