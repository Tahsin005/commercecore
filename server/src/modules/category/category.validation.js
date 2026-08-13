import { z } from 'zod';

export const getCategoryDetailsSchema = z.object({
  params: z.object({
    slug: z.string().min(1, 'Category slug is required'),
  }),
});
