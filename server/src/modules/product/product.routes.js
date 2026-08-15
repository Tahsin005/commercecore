import express from 'express';
import {
  getProducts,
  getProductDetails,
  getProductBySlug,
  getProductVariants,
  getGlobalVariants,
  createProduct,
  updateProduct,
  deleteProduct,
  createGlobalVariant,
  updateGlobalVariant,
  deleteGlobalVariant,
} from './product.controller.js';
import {
  getProductsSchema,
  getProductDetailsSchema,
  getProductSlugSchema,
  createProductSchema,
  updateProductSchema,
  deleteProductSchema,
  createVariantSchema,
  updateVariantSchema,
  deleteVariantSchema,
} from './product.validation.js';
import validate from '../../middlewares/validate.middleware.js';
import { authenticateToken, requireAdmin } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// Public Endpoints
router.get('/', validate(getProductsSchema), getProducts);
router.get('/variants/all', getGlobalVariants);
router.get('/slug/:slug', validate(getProductSlugSchema), getProductBySlug);
router.get('/:id', validate(getProductDetailsSchema), getProductDetails);
router.get('/:id/variants', validate(getProductDetailsSchema), getProductVariants);

// Protected Admin Endpoints - Product Variants
router.post('/variants', authenticateToken, requireAdmin, validate(createVariantSchema), createGlobalVariant);
router.put('/variants/:id', authenticateToken, requireAdmin, validate(updateVariantSchema), updateGlobalVariant);
router.delete('/variants/:id', authenticateToken, requireAdmin, validate(deleteVariantSchema), deleteGlobalVariant);

// Protected Admin Endpoints - Products
router.post('/', authenticateToken, requireAdmin, validate(createProductSchema), createProduct);
router.put('/:id', authenticateToken, requireAdmin, validate(updateProductSchema), updateProduct);
router.delete('/:id', authenticateToken, requireAdmin, validate(deleteProductSchema), deleteProduct);

export default router;
