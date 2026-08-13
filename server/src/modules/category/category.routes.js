import express from 'express';
import { getCategories, getCategoryDetails } from './category.controller.js';
import { getCategoryDetailsSchema } from './category.validation.js';
import validate from '../../middlewares/validate.middleware.js';

const router = express.Router();

router.get('/', getCategories);
router.get('/:slug', validate(getCategoryDetailsSchema), getCategoryDetails);

export default router;
