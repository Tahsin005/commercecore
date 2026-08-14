import { z } from 'zod';

export const addToWishlistSchema = z.object({
  body: z.object({
    productId: z.string().optional(),
    productVariantId: z.string().optional(),
  }).refine((data) => data.productId || data.productVariantId, {
    message: 'productId or productVariantId is required',
  }),
});

export const removeFromWishlistSchema = z.object({
  params: z.object({
    productId: z.string().optional(),
    productVariantId: z.string().optional(),
  }),
});

export const syncWishlistSchema = z.object({
  body: z.object({
    items: z.array(
      z.object({
        productId: z.string().optional(),
        productVariantId: z.string().optional(),
      })
    ),
  }),
});
