import express from 'express';
import multer from 'multer';
import ApiError from '../../utils/ApiError.js';
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

const imageFileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
  ];
  const allowedExtension = /\.(jpg|jpeg|png|gif|webp)$/i;

  if (allowedMimeTypes.includes(file.mimetype) && allowedExtension.test(file.originalname)) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        400,
        'Invalid file type. Only JPG, JPEG, PNG, GIF, and WEBP image files are allowed.'
      ),
      false
    );
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB safety limit
  fileFilter: imageFileFilter,
});

// image upload endpoint (uses least-loaded cloudinary config)
router.post(
  '/image',
  authenticateToken,
  requireAdmin,
  (req, res, next) => {
    upload.single('image')(req, res, (err) => {
      if (err) {
        return next(err);
      }
      next();
    });
  },
  uploadImage
);

// least loaded active config endpoint for uploads
router.get('/least-loaded', authenticateToken, requireAdmin, getLeastLoadedUploadConfig);

// admin upload configurations CRUD
router.get('/', authenticateToken, requireAdmin, getUploadConfigs);
router.post('/', authenticateToken, requireAdmin, validate(createUploadConfigSchema), createUploadConfig);
router.put('/:id', authenticateToken, requireAdmin, validate(updateUploadConfigSchema), updateUploadConfig);
router.delete('/:id', authenticateToken, requireAdmin, validate(deleteUploadConfigSchema), deleteUploadConfig);

export default router;
