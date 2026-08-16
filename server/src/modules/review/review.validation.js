import { z } from 'zod';
import mongoose from 'mongoose';

export const objectIdSchema = z.string().refine(
  (val) => mongoose.Types.ObjectId.isValid(val),
  { message: 'Invalid ObjectId format' }
);

export const objectIdParamSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export const productParamSchema = z.object({
  params: z.object({
    productId: objectIdSchema,
  }),
});

export const createReviewSchema = z.object({
  body: z.object({
    productId: objectIdSchema,
    customerName: z.string().trim().min(1, 'Customer name is required').max(100),
    rating: z.number().int().min(1, 'Rating must be between 1 and 5').max(5, 'Rating must be between 1 and 5'),
    description: z.string().trim().min(1, 'Review description is required').max(2000),
    imageUrl: z.string().trim().nullable().optional(),
  }),
});

export const updateReviewStatusSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    status: z.enum(['pending', 'approved', 'rejected']),
  }),
});

export const reviewQuerySchema = z.object({
  query: z.object({
    productId: objectIdSchema.optional(),
    status: z.enum(['pending', 'approved', 'rejected', 'ALL']).optional(),
    search: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});
