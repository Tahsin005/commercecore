import { z } from 'zod';

const objectIdString = z
  .string()
  .min(1, 'Identifier is required')
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId');

export const getProductsSchema = z.object({
  query: z.object({
    categoryId: objectIdString.optional(),
    isFeatured: z.enum(['true', 'false']).optional(),
    isActive: z.enum(['true', 'false']).optional(),
  }),
});

export const getProductDetailsSchema = z.object({
  params: z.object({
    id: objectIdString,
  }),
});

export const getProductSlugSchema = z.object({
  params: z.object({
    slug: z.string().min(1, 'Product slug is required'),
  }),
});

const cloudinaryImageUrl = z
  .string()
  .trim()
  .refine((url) => {
    try {
      const u = new URL(url);
      return u.protocol === 'https:' && u.hostname === 'res.cloudinary.com';
    } catch {
      return false;
    }
  }, 'Must be a valid HTTPS Cloudinary URL (https://res.cloudinary.com/...)');

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'Product name must be at least 2 characters long'),
    slug: z.string().trim().optional(),
    code: z.string().trim().optional(),
    categoryId: objectIdString.nullable().optional(),
    description: z.string().trim().optional(),
    price: z.number().min(0, 'Price cannot be negative'),
    quantity: z.number().int().min(0, 'Quantity cannot be negative'),
    isFeatured: z.boolean().optional(),
    isActive: z.boolean().optional(),
    images: z.array(cloudinaryImageUrl).optional(),
    variantIds: z.array(objectIdString).optional(),
  }),
});

export const updateProductSchema = z.object({
  params: z.object({
    id: objectIdString,
  }),
  body: z.object({
    name: z.string().trim().min(2, 'Product name must be at least 2 characters long').optional(),
    slug: z.string().trim().optional(),
    code: z.string().trim().optional(),
    categoryId: objectIdString.nullable().optional(),
    description: z.string().trim().optional(),
    price: z.number().min(0, 'Price cannot be negative').optional(),
    quantity: z.number().int().min(0, 'Quantity cannot be negative').optional(),
    isFeatured: z.boolean().optional(),
    isActive: z.boolean().optional(),
    images: z.array(cloudinaryImageUrl).optional(),
    variantIds: z.array(objectIdString).optional(),
  }),
});

export const deleteProductSchema = z.object({
  params: z.object({
    id: objectIdString,
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
    id: objectIdString,
  }),
  body: z.object({
    label: z.string().trim().min(1, 'Variant label is required').optional(),
    order: z.number().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const deleteVariantSchema = z.object({
  params: z.object({
    id: objectIdString,
  }),
});
