import express from 'express';
import {
  getSeoByRoute,
  getAllSeoMeta,
  upsertSeoMeta,
  deleteSeoMeta,
} from './seo.controller.js';
import {
  upsertSeoSchema,
  objectIdParamSchema,
} from './seo.validation.js';
import validate from '../../middlewares/validate.middleware.js';
import { authenticateToken, requireAdmin } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// Public route to fetch SEO by route query (e.g., /api/v1/seo?route=/)
router.get('/', getSeoByRoute);

// Admin-only routes
router.use('/admin', authenticateToken, requireAdmin);
router.get('/admin/all', getAllSeoMeta);
router.put('/admin', validate(upsertSeoSchema), upsertSeoMeta);
router.delete('/admin/:id', validate(objectIdParamSchema), deleteSeoMeta);

export default router;
