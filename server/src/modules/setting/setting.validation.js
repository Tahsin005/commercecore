import { z } from 'zod';

export const deliveryChargeSchema = z.object({
  insideDhaka: z.number().min(0, 'Inside Dhaka delivery charge must be at least 0'),
  outsideDhaka: z.number().min(0, 'Outside Dhaka delivery charge must be at least 0'),
});

export const marqueeSchema = z.object({
  text: z.string().trim().min(1, 'Marquee text is required'),
  isActive: z.boolean(),
});

export const socialLinkSchema = z.object({
  icon: z.string().trim().min(1, 'Icon name is required'),
  url: z.string().trim().min(1, 'URL is required'),
  label: z.string().trim().optional(),
  platform: z.string().trim().optional(),
});

export const footerSettingsSchema = z.object({
  description: z.string().trim().optional(),
  helpline: z.string().trim().optional(),
  socialLinks: z.array(socialLinkSchema).optional().default([]),
});

export const updateSettingSchema = z.object({
  params: z.object({
    key: z.enum(['delivery_charge', 'marquee', 'footer_settings']),
  }),
  body: z.object({
    value: z.any().refine((val) => val !== undefined, { message: 'Value is required' }),
  }),
});
