import express from 'express';
import { getWishlist, addToWishlist, removeFromWishlist, syncWishlist } from './wishlist.controller.js';
import { addToWishlistSchema, removeFromWishlistSchema, syncWishlistSchema } from './wishlist.validation.js';
import validate from '../../middlewares/validate.middleware.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getWishlist);
router.post('/', validate(addToWishlistSchema), addToWishlist);
router.post('/sync', validate(syncWishlistSchema), syncWishlist);
router.delete('/:productVariantId', validate(removeFromWishlistSchema), removeFromWishlist);

export default router;
