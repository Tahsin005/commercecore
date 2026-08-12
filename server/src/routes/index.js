import express from 'express';
import healthRoutes from '../modules/health/health.routes.js';
import userRoutes from '../modules/user/user.routes.js';

const router = express.Router();

router.use('/health', healthRoutes);
router.use('/users', userRoutes);

export default router;
