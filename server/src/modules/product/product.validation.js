import { z } from 'zod';

export const getProductsSchema = z.object({
  query: z.object({
    categoryId: z.string().optional(),
  }),
});

export const getProductDetailsSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Product ID is required'),
  }),
});
