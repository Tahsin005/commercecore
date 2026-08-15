import { z } from 'zod';

const objectIdString = z
  .string()
  .min(1, 'Identifier is required')
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId');

const cloudinaryUrlRegex = /^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/i;

export const createUploadConfigSchema = z.object({
  body: z.object({
    name: z.string().trim().optional(),
    uploadUrl: z
      .string()
      .trim()
      .min(1, 'Upload URL is required')
      .regex(cloudinaryUrlRegex, 'Upload URL must be in Cloudinary format (cloudinary://<api_key>:<api_secret>@<cloud_name>)'),
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
      .regex(cloudinaryUrlRegex, 'Upload URL must be in Cloudinary format (cloudinary://<api_key>:<api_secret>@<cloud_name>)')
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
