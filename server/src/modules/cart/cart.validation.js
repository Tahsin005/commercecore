import { z } from 'zod';

export const addToCartSchema = z.object({
  body: z.object({
    productId: z.string().optional(),
    productVariantId: z.string().optional(),
    quantity: z.number().int().min(1, 'Quantity must be at least 1').optional(),
  }),
});

export const updateCartQuantitySchema = z.object({
  body: z.object({
    id: z.string().optional(),
    productId: z.string().optional(),
    productVariantId: z.string().optional(),
    quantity: z.number().int().min(0, 'Quantity cannot be negative'),
  }),
});

export const removeFromCartSchema = z.object({
  params: z.object({
    id: z.string().optional(),
    productVariantId: z.string().optional(),
  }),
});

export const syncCartSchema = z.object({
  body: z.object({
    items: z.array(
      z.object({
        productId: z.string().optional(),
        productVariantId: z.string().optional(),
        quantity: z.number().int().min(1, 'Quantity must be at least 1').optional(),
      })
    ),
  }),
});
