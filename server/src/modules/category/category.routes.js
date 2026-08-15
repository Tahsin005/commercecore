import express from 'express';
import {
  getCategories,
  getCategoryDetails,
  createCategory,
  updateCategory,
  deleteCategory,
} from './category.controller.js';
import {
  getCategoryDetailsSchema,
  createCategorySchema,
  updateCategorySchema,
  deleteCategorySchema,
} from './category.validation.js';
import validate from '../../middlewares/validate.middleware.js';
import { authenticateToken, requireAdmin } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', getCategories);
router.get('/:slug', validate(getCategoryDetailsSchema), getCategoryDetails);

// Protected Admin Endpoints
router.post('/', authenticateToken, requireAdmin, validate(createCategorySchema), createCategory);
router.put('/:id', authenticateToken, requireAdmin, validate(updateCategorySchema), updateCategory);
router.delete('/:id', authenticateToken, requireAdmin, validate(deleteCategorySchema), deleteCategory);

export default router;
