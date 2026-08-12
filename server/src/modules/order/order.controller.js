import { createOrderService, getOrderByNumberService } from './order.service.js';
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
