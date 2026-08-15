import { z } from 'zod';

const objectIdString = z
  .string()
  .min(1, 'Identifier is required')
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId');

export const bannerSchema = z.object({
  body: z.object({
    imageUrl: z.string().trim().min(1, 'Image URL is required'),
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

export const contentBlockSchema = z.object({
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
