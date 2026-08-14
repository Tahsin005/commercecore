import { z } from 'zod';

export const placeOrderSchema = z.object({
  body: z.object({
    customerName: z.string().min(1, 'Customer name is required'),
    phone: z.string().min(1, 'Phone number is required'),
    email: z.string().email('Invalid email address').or(z.literal('')).optional(),
    shippingAddress: z.string().min(1, 'Shipping address is required'),
    deliveryZone: z.enum(['inside_dhaka', 'outside_dhaka']),
    items: z
      .array(
        z.object({
          productId: z.string().optional(),
          productVariantId: z.string().optional(),
          selectedVariantLabel: z.string().optional(),
          quantity: z.number().int().min(1, 'Quantity must be at least 1'),
        })
      )
      .min(1, 'Order must contain at least one item'),
    guestCartItems: z
      .array(
        z.object({
          productId: z.string().optional(),
          productVariantId: z.string().optional(),
          selectedVariantLabel: z.string().optional(),
          quantity: z.number().optional(),
        })
      )
      .optional(),
    guestWishlistItems: z
      .array(
        z.object({
          productId: z.string().optional(),
          productVariantId: z.string().optional(),
        })
      )
      .optional(),
  }),
});

export const getOrderDetailsSchema = z.object({
  params: z.object({
    orderNumber: z.string().min(1, 'Order number is required'),
  }),
});
