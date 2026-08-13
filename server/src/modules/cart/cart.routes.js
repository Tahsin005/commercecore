import express from 'express';
import { getCart, addToCart, updateCartQuantity, removeFromCart, clearCart, syncCart } from './cart.controller.js';
import { addToCartSchema, updateCartQuantitySchema, removeFromCartSchema, syncCartSchema } from './cart.validation.js';
import validate from '../../middlewares/validate.middleware.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getCart);
router.post('/', validate(addToCartSchema), addToCart);
router.put('/', validate(updateCartQuantitySchema), updateCartQuantity);
router.post('/sync', validate(syncCartSchema), syncCart);
router.delete('/', clearCart);
router.delete('/:productVariantId', validate(removeFromCartSchema), removeFromCart);

export default router;
