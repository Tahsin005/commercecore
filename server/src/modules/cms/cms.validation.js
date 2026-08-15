import { z } from 'zod';

export const objectIdString = z
  .string()
  .min(1, 'Identifier is required')
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId');

export const objectIdParamSchema = z.object({
  params: z.object({
    id: objectIdString,
  }),
});

export const ALLOWED_CONTENT_KEYS = ['about_us', 'contact_us', 'how_to_buy', 'return_policy'];

export const bannerSchema = z.object({
  body: z.object({
    imageUrl: z.string().trim().min(1, 'Image URL is required'),
    title: z.string().trim().optional(),
    sortOrder: z.number().int().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const updateBannerSchema = z.object({
  params: z.object({
    id: objectIdString,
  }),
  body: z.object({
    imageUrl: z.string().trim().min(1, 'Image URL is required').optional(),
    title: z.string().trim().optional(),
    sortOrder: z.number().int().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const contactChannelSchema = z.object({
  body: z.object({
    label: z.string().trim().min(1, 'Label is required'),
    phoneNumber: z.string().trim().min(1, 'Phone number is required'),
    type: z.enum(['call', 'whatsapp', 'bkash', 'nagad']).optional(),
    sortOrder: z.number().int().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const updateContactChannelSchema = z.object({
  params: z.object({
    id: objectIdString,
  }),
  body: z.object({
    label: z.string().trim().min(1, 'Label is required').optional(),
    phoneNumber: z.string().trim().min(1, 'Phone number is required').optional(),
    type: z.enum(['call', 'whatsapp', 'bkash', 'nagad']).optional(),
    sortOrder: z.number().int().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const contentBlockSchema = z.object({
  params: z.object({
    key: z.enum(['about_us', 'contact_us', 'how_to_buy', 'return_policy']),
  }),
  body: z.object({
    title: z.string().trim().min(1, 'Title is required'),
    body: z.string().min(1, 'Content body is required'),
  }),
});

export const productInfoBulletSchema = z.object({
  body: z.object({
    text: z.string().trim().min(1, 'Text is required'),
    sortOrder: z.number().int().optional(),
    isActive: z.boolean().optional(),
    productId: objectIdString.nullable().optional(),
  }),
});

export const updateProductInfoBulletSchema = z.object({
  params: z.object({
    id: objectIdString,
  }),
  body: z.object({
    text: z.string().trim().min(1, 'Text is required').optional(),
    sortOrder: z.number().int().optional(),
    isActive: z.boolean().optional(),
    productId: objectIdString.nullable().optional(),
  }),
});
