import { z } from 'zod';

export const addToCartSchema = z.object({
  body: z
    .object({
      productId: z.string().optional(),
      productVariantId: z.string().optional(),
      color: z.string().trim().optional(),
      quantity: z.number().int().min(1, 'Quantity must be at least 1').optional(),
    })
    .refine((data) => data.productId || data.productVariantId, {
      message: 'Either productId or productVariantId must be provided',
    }),
});

export const updateCartQuantitySchema = z.object({
  body: z.object({
    id: z.string().optional(),
    productId: z.string().optional(),
    productVariantId: z.string().optional(),
    color: z.string().trim().optional(),
    quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  }),
});

export const removeFromCartSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Cart item ID is required'),
  }),
  query: z.object({
    color: z.string().trim().optional(),
  }).optional(),
});

export const syncCartSchema = z.object({
  body: z.object({
    items: z.array(
      z.object({
        productId: z.string().optional(),
        productVariantId: z.string().optional(),
        color: z.string().trim().optional(),
        quantity: z.number().int().min(1, 'Quantity must be at least 1').optional(),
      })
    ),
  }),
});
