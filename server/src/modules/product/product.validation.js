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
    search: z.string().trim().optional(),
    sortBy: z.enum(['newest', 'oldest', 'price_asc', 'price_desc', 'name_asc', 'name_desc']).optional(),
    minPrice: z.string().optional(),
    maxPrice: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
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

const variantInputSchema = z
  .object({
    productVariantId: objectIdString,
    price: z.number().min(0, 'Variant price cannot be negative').nullable().optional(),
    discountPrice: z.number().min(0, 'Variant discount price cannot be negative').nullable().optional(),
    quantity: z.number().int().min(0, 'Variant quantity cannot be negative').optional(),
  })
  .refine(
    (data) => {
      if (
        data.discountPrice !== undefined &&
        data.discountPrice !== null &&
        data.discountPrice > 0 &&
        data.price !== undefined &&
        data.price !== null
      ) {
        return data.discountPrice < data.price;
      }
      return true;
    },
    {
      message: 'Variant discount price must be less than variant regular price',
      path: ['discountPrice'],
    }
  );

export const productSeoSchema = z.object({
  title: z.string().trim().optional().default(''),
  description: z.string().trim().optional().default(''),
  keywords: z.union([z.array(z.string().trim()), z.string().trim()]).optional().transform((val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val.map((k) => k.trim()).filter(Boolean);
    return val.split(',').map((k) => k.trim()).filter(Boolean);
  }),
  ogImage: z.string().trim().optional().default(''),
  noIndex: z.boolean().optional().default(false),
});

export const createProductSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(2, 'Product name must be at least 2 characters long'),
      slug: z.string().trim().optional(),
      code: z.string().trim().optional(),
      categoryId: objectIdString,
      description: z.string().trim().optional(),
      price: z.number().min(0, 'Price cannot be negative'),
      discountPrice: z.number().min(0, 'Discount price cannot be negative').nullable().optional(),
      isFeatured: z.boolean().optional(),
      isActive: z.boolean().optional(),
      images: z.array(cloudinaryImageUrl).optional(),
      colors: z.array(z.string().trim()).optional(),
      variantIds: z.array(objectIdString).optional(),
      variants: z.array(variantInputSchema).optional(),
      seo: productSeoSchema.optional(),
    })
    .refine(
      (data) => {
        if (Array.isArray(data.images) && Array.isArray(data.colors)) {
          if (data.colors.length > 0 && data.colors.length !== data.images.length) return false;
        }
        if (data.discountPrice !== undefined && data.discountPrice !== null && data.discountPrice > 0) {
          if (data.discountPrice >= data.price) return false;
        }
        if (Array.isArray(data.variants)) {
          for (const v of data.variants) {
            if (v && v.discountPrice !== undefined && v.discountPrice !== null && v.discountPrice > 0) {
              const effectiveRegularPrice = v.price !== undefined && v.price !== null ? v.price : data.price;
              if (v.discountPrice >= effectiveRegularPrice) return false;
            }
          }
        }
        return true;
      },
      {
        message: 'Discount price must be less than regular price and colors must match number of images',
        path: ['discountPrice'],
      }
    ),
});

export const updateProductSchema = z.object({
  params: z.object({
    id: objectIdString,
  }),
  body: z
    .object({
      name: z.string().trim().min(2, 'Product name must be at least 2 characters long').optional(),
      slug: z.string().trim().optional(),
      code: z.string().trim().optional(),
      categoryId: objectIdString.optional(),
      description: z.string().trim().optional(),
      price: z.number().min(0, 'Price cannot be negative').optional(),
      discountPrice: z.number().min(0, 'Discount price cannot be negative').nullable().optional(),
      isFeatured: z.boolean().optional(),
      isActive: z.boolean().optional(),
      images: z.array(cloudinaryImageUrl).optional(),
      colors: z.array(z.string().trim()).optional(),
      variantIds: z.array(objectIdString).optional(),
      variants: z.array(variantInputSchema).optional(),
      seo: productSeoSchema.optional(),
    })
    .refine(
      (data) => {
        if (Array.isArray(data.images) && Array.isArray(data.colors)) {
          if (data.colors.length > 0 && data.colors.length !== data.images.length) return false;
        }
        if (
          data.discountPrice !== undefined &&
          data.discountPrice !== null &&
          data.discountPrice > 0 &&
          data.price !== undefined
        ) {
          if (data.discountPrice >= data.price) return false;
        }
        if (data.price !== undefined && Array.isArray(data.variants)) {
          for (const v of data.variants) {
            if (v && v.discountPrice !== undefined && v.discountPrice !== null && v.discountPrice > 0) {
              const effectiveRegularPrice = v.price !== undefined && v.price !== null ? v.price : data.price;
              if (v.discountPrice >= effectiveRegularPrice) return false;
            }
          }
        }
        return true;
      },
      {
        message: 'Discount price must be less than regular price and colors must match number of images',
        path: ['discountPrice'],
      }
    ),
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
