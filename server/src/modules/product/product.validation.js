import { z } from 'zod';

export const getProductsSchema = z.object({
  query: z.object({
    categoryId: z.string().optional(),
    isFeatured: z.enum(['true', 'false']).optional(),
    isActive: z.enum(['true', 'false']).optional(),
  }),
});

export const getProductDetailsSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Product ID is required'),
  }),
});

export const getProductSlugSchema = z.object({
  params: z.object({
    slug: z.string().min(1, 'Product slug is required'),
  }),
});

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'Product name must be at least 2 characters long'),
    slug: z.string().trim().optional(),
    code: z.string().trim().optional(),
    categoryId: z.string().nullable().optional(),
    description: z.string().trim().optional(),
    price: z.number().min(0, 'Price cannot be negative'),
    quantity: z.number().int().min(0, 'Quantity cannot be negative'),
    isFeatured: z.boolean().optional(),
    isActive: z.boolean().optional(),
    variantIds: z.array(z.string()).optional(),
  }),
});

export const updateProductSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Product ID is required'),
  }),
  body: z.object({
    name: z.string().trim().min(2, 'Product name must be at least 2 characters long').optional(),
    slug: z.string().trim().optional(),
    code: z.string().trim().optional(),
    categoryId: z.string().nullable().optional(),
    description: z.string().trim().optional(),
    price: z.number().min(0, 'Price cannot be negative').optional(),
    quantity: z.number().int().min(0, 'Quantity cannot be negative').optional(),
    isFeatured: z.boolean().optional(),
    isActive: z.boolean().optional(),
    variantIds: z.array(z.string()).optional(),
  }),
});

export const deleteProductSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Product ID is required'),
  }),
});

export const createVariantSchema = z.object({
  body: z.object({
    label: z.string().trim().min(1, 'Variant label is required'),
    order: z.number().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const updateVariantSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Variant ID is required'),
  }),
  body: z.object({
    label: z.string().trim().min(1, 'Variant label is required').optional(),
    order: z.number().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const deleteVariantSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Variant ID is required'),
  }),
});
