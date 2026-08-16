import {
  createOrderService,
  getOrderByNumberService,
  getAllOrdersAdminService,
  getOrderByIdAdminService,
  updateOrderStatusService,
  getUserOrdersService,
} from './order.service.js';
import ApiResponse from '../../utils/ApiResponse.js';

export const placeOrder = async (req, res, next) => {
  try {
    const result = await createOrderService(req.body, req.user);
    res.status(201).json(new ApiResponse(201, result, 'Order placed successfully'));
  } catch (error) {
    next(error);
  }
};

export const getOrderDetails = async (req, res, next) => {
  try {
    const result = await getOrderByNumberService(req.params.orderNumber);
    res.status(200).json(new ApiResponse(200, result, 'Order details retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const getAdminOrders = async (req, res, next) => {
  try {
    const result = await getAllOrdersAdminService(req.query);
    res.status(200).json(new ApiResponse(200, result, 'Admin orders retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const getAdminOrderById = async (req, res, next) => {
  try {
    const result = await getOrderByIdAdminService(req.params.id);
    res.status(200).json(new ApiResponse(200, result, 'Admin order details retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const result = await updateOrderStatusService(req.params.id, req.body.status);
    res.status(200).json(new ApiResponse(200, result, 'Order status updated successfully'));
  } catch (error) {
    next(error);
  }
};

export const getUserOrders = async (req, res, next) => {
  try {
    const result = await getUserOrdersService(req.user.id, req.query);
    res.status(200).json(new ApiResponse(200, result, 'User orders retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

