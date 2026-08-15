import { z } from "zod";

const cloudinaryUrlRegex = /^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/i;

export const uploadConfigSchema = z.object({
  name: z.string().trim().optional(),
  uploadUrl: z
    .string()
    .trim()
    .min(1, { message: "Upload URL is required" })
    .regex(cloudinaryUrlRegex, {
      message: "Upload URL must be in Cloudinary format (cloudinary://<api_key>:<api_secret>@<cloud_name>)",
    }),
  isActive: z.boolean().optional(),
});

export type UploadConfigInput = z.infer<typeof uploadConfigSchema>;
