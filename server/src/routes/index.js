import express from 'express';
import healthRoutes from '../modules/health/health.routes.js';
import userRoutes from '../modules/user/user.routes.js';
import categoryRoutes from '../modules/category/category.routes.js';
import productRoutes from '../modules/product/product.routes.js';
import cartRoutes from '../modules/cart/cart.routes.js';
import wishlistRoutes from '../modules/wishlist/wishlist.routes.js';
import orderRoutes from '../modules/order/order.routes.js';
import uploadConfigRoutes from '../modules/upload/uploadConfig.routes.js';
import settingRoutes from '../modules/setting/setting.routes.js';
import cmsRoutes from '../modules/cms/cms.routes.js';
import reviewRoutes from '../modules/review/review.routes.js';

const router = express.Router();

router.use('/health', healthRoutes);
router.use('/users', userRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/orders', orderRoutes);
router.use('/upload-configs', uploadConfigRoutes);
router.use('/settings', settingRoutes);
router.use('/cms', cmsRoutes);
router.use('/reviews', reviewRoutes);

export default router;
