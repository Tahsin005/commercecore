import { z } from 'zod';

export const addToWishlistSchema = z.object({
  body: z.object({
    productId: z.string().optional(),
    productVariantId: z.string().optional(),
    color: z.string().trim().optional(),
  }).refine((data) => data.productId || data.productVariantId, {
    message: 'productId or productVariantId is required',
  }),
});

export const removeFromWishlistSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Item ID is required'),
  }),
  query: z.object({
    color: z.string().trim().optional(),
  }).optional(),
});

export const syncWishlistSchema = z.object({
  body: z.object({
    items: z.array(
      z
        .object({
          productId: z.string().optional(),
          productVariantId: z.string().optional(),
          color: z.string().trim().optional(),
        })
        .refine((data) => data.productId || data.productVariantId, {
          message: 'productId or productVariantId is required',
        })
    ),
  }),
});
