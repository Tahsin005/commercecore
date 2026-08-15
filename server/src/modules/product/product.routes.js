import express from 'express';
import {
  getProducts,
  getProductDetails,
  getProductBySlug,
  getProductVariants,
  getGlobalVariants,
} from './product.controller.js';
import {
  getProductsSchema,
  getProductDetailsSchema,
  getProductSlugSchema,
} from './product.validation.js';
import validate from '../../middlewares/validate.middleware.js';

const router = express.Router();

router.get('/', validate(getProductsSchema), getProducts);
router.get('/variants/all', getGlobalVariants);
router.get('/slug/:slug', validate(getProductSlugSchema), getProductBySlug);
router.get('/:id', validate(getProductDetailsSchema), getProductDetails);
router.get('/:id/variants', validate(getProductDetailsSchema), getProductVariants);

export default router;
