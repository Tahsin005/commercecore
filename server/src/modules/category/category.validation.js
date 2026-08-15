import { z } from 'zod';

export const getCategoryDetailsSchema = z.object({
  params: z.object({
    slug: z.string().min(1, 'Category slug is required'),
  }),
});

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'Category name must be at least 2 characters long'),
    slug: z.string().trim().optional(),
    isFeatured: z.boolean().optional(),
  }),
});

export const updateCategorySchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Category ID is required'),
  }),
  body: z.object({
    name: z.string().trim().min(2, 'Category name must be at least 2 characters long').optional(),
    slug: z.string().trim().optional(),
    isFeatured: z.boolean().optional(),
  }),
});

export const deleteCategorySchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Category ID is required'),
  }),
});
