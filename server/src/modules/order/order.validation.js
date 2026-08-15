import { z } from 'zod';

const objectIdString = z
  .string()
  .min(1, 'Identifier is required')
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId');

export const orderStatusEnum = z.enum([
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'RETURNED',
]);

export const placeOrderSchema = z.object({
  body: z.object({
    customerName: z.string().min(1, 'Customer name is required'),
    phone: z.string().min(1, 'Phone number is required'),
    email: z.string().email('Invalid email address').or(z.literal('')).optional(),
    shippingAddress: z.string().min(1, 'Shipping address is required'),
    notes: z.string().trim().optional(),
    deliveryZone: z.enum(['inside_dhaka', 'outside_dhaka']),
    items: z
      .array(
        z.object({
          productId: objectIdString,
          productVariantId: objectIdString.nullable().optional(),
          selectedVariantLabel: z.string().optional(),
          quantity: z.number().int().min(1, 'Quantity must be at least 1'),
        })
      )
      .min(1, 'Order must contain at least one item'),
    guestCartItems: z
      .array(
        z.object({
          productId: objectIdString.optional(),
          productVariantId: objectIdString.nullable().optional(),
          selectedVariantLabel: z.string().optional(),
          quantity: z.number().optional(),
        })
      )
      .optional(),
    guestWishlistItems: z
      .array(
        z.object({
          productId: objectIdString.optional(),
          productVariantId: objectIdString.optional(),
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

export const getAdminOrdersSchema = z.object({
  query: z.object({
    status: z.union([orderStatusEnum, z.literal('ALL')]).optional(),
    search: z.string().optional(),
    page: z.string().regex(/^\d+$/, 'Page must be a positive integer').optional(),
    limit: z
      .string()
      .regex(/^\d+$/, 'Limit must be a positive integer')
      .refine(
        (val) => !val || (parseInt(val, 10) >= 1 && parseInt(val, 10) <= 100),
        'Limit must be between 1 and 100'
      )
      .optional(),
  }),
});

export const getAdminOrderByIdSchema = z.object({
  params: z.object({
    id: objectIdString,
  }),
});

export const updateOrderStatusSchema = z.object({
  params: z.object({
    id: objectIdString,
  }),
  body: z.object({
    status: orderStatusEnum,
  }),
});
