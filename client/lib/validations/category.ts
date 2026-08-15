import { z } from "zod";

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Category name must be at least 2 characters long" }),
  slug: z.string().trim().optional(),
  isFeatured: z.boolean().optional(),
  imageUrl: z.string().trim().optional(),
});

export type CategoryInput = z.infer<typeof categorySchema>;
