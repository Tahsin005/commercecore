import { z } from 'zod';

export const addToWishlistSchema = z.object({
  body: z.object({
    productVariantId: z.string().min(1, 'Product Variant ID is required'),
  }),
});

export const removeFromWishlistSchema = z.object({
  params: z.object({
    productVariantId: z.string().min(1, 'Product Variant ID is required'),
  }),
});

export const syncWishlistSchema = z.object({
  body: z.object({
    items: z.array(
      z.object({
        productVariantId: z.string().min(1, 'Product Variant ID is required'),
      })
    ),
  }),
});
