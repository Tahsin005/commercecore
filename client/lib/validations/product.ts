import { z } from "zod";

const cloudinaryImageUrl = z
  .string()
  .trim()
  .refine((url) => {
    try {
      const u = new URL(url);
      return u.protocol === "https:" && u.hostname === "res.cloudinary.com";
    } catch {
      return false;
    }
  }, { message: "Must be a valid HTTPS Cloudinary URL (https://res.cloudinary.com/...)" });

export const variantInputItemSchema = z
  .object({
    productVariantId: z.string(),
    price: z.number().min(0, { message: "Price cannot be negative" }).nullable().optional(),
    discountPrice: z.number().min(0, { message: "Discount price cannot be negative" }).nullable().optional(),
    quantity: z.number().int({ message: "Stock quantity must be an integer" }).min(0, { message: "Quantity cannot be negative" }),
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
      message: "Variant discount price must be less than variant price",
      path: ["discountPrice"],
    }
  );

export const productSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, { message: "Product name must be at least 2 characters long" }),
    slug: z.string().trim().optional(),
    code: z.string().trim().optional(),
    categoryId: z
      .string()
      .min(1, { message: "Please select a category" }),
    description: z.string().trim().optional(),
    price: z
      .number({ message: "Base price is required and must be a valid number" })
      .min(0, { message: "Base price cannot be negative" }),
    discountPrice: z
      .number({ message: "Discount price must be a valid number" })
      .min(0, { message: "Discount price cannot be negative" })
      .nullable()
      .optional(),
    isFeatured: z.boolean().optional(),
    isActive: z.boolean().optional(),
    images: z.array(cloudinaryImageUrl).optional(),
    variantIds: z.array(z.string()).optional(),
    variants: z.array(variantInputItemSchema).optional(),
  })
  .refine(
    (data) => {
      if (data.discountPrice !== undefined && data.discountPrice !== null && data.discountPrice > 0) {
        return data.discountPrice < data.price;
      }
      return true;
    },
    {
      message: "Discount price must be less than regular price",
      path: ["discountPrice"],
    }
  );

export const variantSchema = z.object({
  label: z.string().trim().min(1, { message: "Variant label is required" }),
  order: z.number().int().optional(),
  isActive: z.boolean().optional(),
  price: z.number().min(0, { message: "Variant price cannot be negative" }).nullable().optional(),
  discountPrice: z.number().min(0, { message: "Variant discount price cannot be negative" }).nullable().optional(),
});

export type ProductInput = z.infer<typeof productSchema>;
export type VariantInput = z.infer<typeof variantSchema>;
