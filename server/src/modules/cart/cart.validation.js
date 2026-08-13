import { z } from 'zod';

export const addToCartSchema = z.object({
  body: z.object({
    productVariantId: z.string().min(1, 'Product Variant ID is required'),
    quantity: z.number().int().min(1, 'Quantity must be at least 1').optional(),
  }),
});

export const updateCartQuantitySchema = z.object({
  body: z.object({
    productVariantId: z.string().min(1, 'Product Variant ID is required'),
    quantity: z.number().int().min(0, 'Quantity cannot be negative'),
  }),
});

export const removeFromCartSchema = z.object({
  params: z.object({
    productVariantId: z.string().min(1, 'Product Variant ID is required'),
  }),
});

export const syncCartSchema = z.object({
  body: z.object({
    items: z.array(
      z.object({
        productVariantId: z.string().min(1, 'Product Variant ID is required'),
        quantity: z.number().int().min(1, 'Quantity must be at least 1').optional(),
      })
    ),
  }),
});
