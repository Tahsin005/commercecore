import { z } from 'zod';

const objectIdString = z
  .string()
  .min(1, 'Identifier is required')
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId');

const urlOrCloudinaryRegex = /^(https?:\/\/|cloudinary:\/\/).+$/i;

export const createUploadConfigSchema = z.object({
  body: z.object({
    name: z.string().trim().optional(),
    uploadUrl: z
      .string()
      .trim()
      .min(1, 'Upload URL is required')
      .regex(urlOrCloudinaryRegex, 'Upload URL must start with http://, https://, or cloudinary://'),
    isActive: z.boolean().optional(),
  }),
});

export const updateUploadConfigSchema = z.object({
  params: z.object({
    id: objectIdString,
  }),
  body: z.object({
    name: z.string().trim().optional(),
    uploadUrl: z
      .string()
      .trim()
      .regex(urlOrCloudinaryRegex, 'Upload URL must start with http://, https://, or cloudinary://')
      .optional(),
    load: z.number().int().min(0, 'Load count cannot be negative').optional(),
    isActive: z.boolean().optional(),
  }),
});

export const deleteUploadConfigSchema = z.object({
  params: z.object({
    id: objectIdString,
  }),
});
