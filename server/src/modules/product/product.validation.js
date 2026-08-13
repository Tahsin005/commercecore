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
