import express from 'express';
import { getProducts, getProductDetails } from './product.controller.js';
import { getProductsSchema, getProductDetailsSchema } from './product.validation.js';
import validate from '../../middlewares/validate.middleware.js';

const router = express.Router();

router.get('/', validate(getProductsSchema), getProducts);
router.get('/:id', validate(getProductDetailsSchema), getProductDetails);

export default router;
