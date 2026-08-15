import {
  getUserCartService,
  addToCartService,
  updateCartQuantityService,
  removeFromCartService,
  clearUserCartService,
  syncGuestCartService,
} from './cart.service.js';
import ApiResponse from '../../utils/ApiResponse.js';

export const getCart = async (req, res, next) => {
  try {
    const cart = await getUserCartService(req.user.id);
    res.status(200).json(new ApiResponse(200, cart, 'Cart retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (req, res, next) => {
  try {
    const { productId, productVariantId, quantity } = req.body;
    const cart = await addToCartService(req.user.id, productId, productVariantId, quantity);
    res.status(200).json(new ApiResponse(200, cart, 'Item added to cart successfully'));
  } catch (error) {
    next(error);
  }
};

export const updateCartQuantity = async (req, res, next) => {
  try {
    const { id, productVariantId, quantity } = req.body;
    const itemId = id || productVariantId;
    const cart = await updateCartQuantityService(req.user.id, itemId, quantity);
    res.status(200).json(new ApiResponse(200, cart, 'Cart quantity updated successfully'));
  } catch (error) {
    next(error);
  }
};

export const removeFromCart = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cart = await removeFromCartService(req.user.id, id);
    res.status(200).json(new ApiResponse(200, cart, 'Item removed from cart successfully'));
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    const cart = await clearUserCartService(req.user.id);
    res.status(200).json(new ApiResponse(200, cart, 'Cart cleared successfully'));
  } catch (error) {
    next(error);
  }
};

export const syncCart = async (req, res, next) => {
  try {
    const { items } = req.body;
    const cart = await syncGuestCartService(req.user.id, items || []);
    res.status(200).json(new ApiResponse(200, cart, 'Cart synced successfully'));
  } catch (error) {
    next(error);
  }
};
