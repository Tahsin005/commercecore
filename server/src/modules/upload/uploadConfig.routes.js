import express from 'express';
import multer from 'multer';
import {
  getUploadConfigs,
  getLeastLoadedUploadConfig,
  createUploadConfig,
  updateUploadConfig,
  deleteUploadConfig,
  uploadImage,
} from './uploadConfig.controller.js';
import {
  createUploadConfigSchema,
  updateUploadConfigSchema,
  deleteUploadConfigSchema,
} from './uploadConfig.validation.js';
import validate from '../../middlewares/validate.middleware.js';
import { authenticateToken, requireAdmin } from '../../middlewares/auth.middleware.js';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// image upload endpoint (uses least-loaded cloudinary config)
router.post('/image', authenticateToken, upload.single('image'), uploadImage);

// least loaded active config endpoint for uploads
router.get('/least-loaded', authenticateToken, getLeastLoadedUploadConfig);

// admin upload configurations CRUD
router.get('/', authenticateToken, requireAdmin, getUploadConfigs);
router.post('/', authenticateToken, requireAdmin, validate(createUploadConfigSchema), createUploadConfig);
router.put('/:id', authenticateToken, requireAdmin, validate(updateUploadConfigSchema), updateUploadConfig);
router.delete('/:id', authenticateToken, requireAdmin, validate(deleteUploadConfigSchema), deleteUploadConfig);

export default router;
