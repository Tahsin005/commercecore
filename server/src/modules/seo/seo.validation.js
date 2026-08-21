import { z } from 'zod';

export const upsertSeoSchema = z.object({
  body: z.object({
    route: z
      .string()
      .trim()
      .min(1, 'Route is required')
      .transform((val) => {
        const lower = val.toLowerCase();
        return lower.startsWith('/') ? lower : `/${lower}`;
      }),
    title: z.string().trim().optional().default(''),
    description: z.string().trim().optional().default(''),
    ogTitle: z.string().trim().optional().default(''),
    ogDescription: z.string().trim().optional().default(''),
    ogImage: z.string().trim().optional().default(''),
    canonicalUrl: z.string().trim().optional().default(''),
    keywords: z.union([z.array(z.string().trim()), z.string().trim()]).optional().transform((val) => {
      if (!val) return [];
      if (Array.isArray(val)) return val.map((k) => k.trim()).filter(Boolean);
      return val.split(',').map((k) => k.trim()).filter(Boolean);
    }),
    noIndex: z.boolean().optional().default(false),
  }),
});

export const queryRouteSchema = z.object({
  query: z.object({
    route: z
      .string()
      .trim()
      .min(1, 'Route is required')
      .transform((val) => {
        const lower = val.toLowerCase();
        return lower.startsWith('/') ? lower : `/${lower}`;
      }),
  }),
});

export const objectIdParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format'),
  }),
});
