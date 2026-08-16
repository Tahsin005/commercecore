import express from 'express';
import {
  placeOrder,
  getOrderDetails,
  getAdminOrders,
  getAdminOrderById,
  updateOrderStatus,
  getUserOrders,
} from './order.controller.js';
import {
  placeOrderSchema,
  getOrderDetailsSchema,
  getAdminOrdersSchema,
  getAdminOrderByIdSchema,
  updateOrderStatusSchema,
} from './order.validation.js';
import validate from '../../middlewares/validate.middleware.js';
import { authenticateToken, requireAdmin, optionalAuth } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// Protected Admin Endpoints
router.get('/admin', authenticateToken, requireAdmin, validate(getAdminOrdersSchema), getAdminOrders);
router.get('/admin/:id', authenticateToken, requireAdmin, validate(getAdminOrderByIdSchema), getAdminOrderById);
router.patch('/admin/:id/status', authenticateToken, requireAdmin, validate(updateOrderStatusSchema), updateOrderStatus);

// Customer Endpoints
router.get('/my-orders', authenticateToken, getUserOrders);
router.post('/', optionalAuth, validate(placeOrderSchema), placeOrder);
router.get('/:orderNumber', optionalAuth, validate(getOrderDetailsSchema), getOrderDetails);

export default router;

