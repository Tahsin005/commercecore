import express from 'express';
import { validate } from '../../middlewares/validate.middleware.js';
import { authenticateToken, requireAdmin, optionalAuth } from '../../middlewares/auth.middleware.js';
import {
  createReview,
  getProductApprovedReviews,
  getAllReviewsAdmin,
  updateReviewStatus,
  deleteReviewAdmin,
} from './review.controller.js';
import {
  createReviewSchema,
  updateReviewStatusSchema,
  reviewQuerySchema,
  productParamSchema,
  objectIdParamSchema,
} from './review.validation.js';

const router = express.Router();

// Public Routes
router.post('/', optionalAuth, validate(createReviewSchema), createReview);
router.get('/product/:productId', validate(productParamSchema), getProductApprovedReviews);

// Admin Moderation Routes
router.get('/admin', authenticateToken, requireAdmin, validate(reviewQuerySchema), getAllReviewsAdmin);
router.patch('/admin/:id/status', authenticateToken, requireAdmin, validate(updateReviewStatusSchema), updateReviewStatus);
router.delete('/admin/:id', authenticateToken, requireAdmin, validate(objectIdParamSchema), deleteReviewAdmin);

export default router;
