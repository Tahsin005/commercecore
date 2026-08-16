import { z } from 'zod';

const objectIdSchema = z
  .string()
  .min(1, 'Address ID is required')
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid address ID format');

export const createAddressSchema = z.object({
  body: z.object({
    label: z.string().trim().max(50).optional().default('Home'),
    fullAddress: z.string().trim().min(3, 'Full address must be at least 3 characters'),
    city: z.string().trim().min(2, 'City name is required').default('Dhaka'),
    isDefault: z.boolean().optional().default(false),
  }),
});

export const updateAddressSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    label: z.string().trim().max(50).optional(),
    fullAddress: z.string().trim().min(3, 'Full address must be at least 3 characters').optional(),
    city: z.string().trim().min(2, 'City name is required').optional(),
    isDefault: z.boolean().optional(),
  }),
});

export const addressIdParamSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});
