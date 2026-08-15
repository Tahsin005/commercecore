import { z } from "zod";

const urlOrCloudinaryRegex = /^(https?:\/\/|cloudinary:\/\/).+$/i;

export const uploadConfigSchema = z.object({
  name: z.string().trim().optional(),
  uploadUrl: z
    .string()
    .trim()
    .min(1, { message: "Upload URL is required" })
    .regex(urlOrCloudinaryRegex, {
      message: "Upload URL must start with http://, https://, or cloudinary://",
    }),
  isActive: z.boolean().optional(),
});

export type UploadConfigInput = z.infer<typeof uploadConfigSchema>;
