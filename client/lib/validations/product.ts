import { z } from "zod";

export const productSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Product name must be at least 2 characters long" }),
  slug: z.string().trim().optional(),
  code: z.string().trim().optional(),
  categoryId: z.string().nullable().optional(),
  description: z.string().trim().optional(),
  price: z.number().min(0, { message: "Price cannot be negative" }),
  quantity: z.number().int().min(0, { message: "Quantity cannot be negative" }),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  variantIds: z.array(z.string()).optional(),
});

export const variantSchema = z.object({
  label: z.string().trim().min(1, { message: "Variant label is required" }),
  order: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export type ProductInput = z.infer<typeof productSchema>;
export type VariantInput = z.infer<typeof variantSchema>;
