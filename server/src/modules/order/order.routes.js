import express from 'express';
import { placeOrder, getOrderDetails } from './order.controller.js';
import { placeOrderSchema, getOrderDetailsSchema } from './order.validation.js';
import validate from '../../middlewares/validate.middleware.js';
import { optionalAuth } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', optionalAuth, validate(placeOrderSchema), placeOrder);
router.get('/:orderNumber', optionalAuth, validate(getOrderDetailsSchema), getOrderDetails);

export default router;
