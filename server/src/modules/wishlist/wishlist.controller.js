import {
  getUserWishlistService,
  addToWishlistService,
  removeFromWishlistService,
  syncGuestWishlistService,
} from './wishlist.service.js';
import ApiResponse from '../../utils/ApiResponse.js';

export const getWishlist = async (req, res, next) => {
  try {
    const wishlist = await getUserWishlistService(req.user.id);
    res.status(200).json(new ApiResponse(200, wishlist, 'Wishlist retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const addToWishlist = async (req, res, next) => {
  try {
    const { productId, productVariantId } = req.body;
    const wishlist = await addToWishlistService(req.user.id, productId, productVariantId);
    res.status(200).json(new ApiResponse(200, wishlist, 'Item added to wishlist successfully'));
  } catch (error) {
    next(error);
  }
};

export const removeFromWishlist = async (req, res, next) => {
  try {
    const { id } = req.params;
    const wishlist = await removeFromWishlistService(req.user.id, id);
    res.status(200).json(new ApiResponse(200, wishlist, 'Item removed from wishlist successfully'));
  } catch (error) {
    next(error);
  }
};

export const syncWishlist = async (req, res, next) => {
  try {
    const { items } = req.body;
    const wishlist = await syncGuestWishlistService(req.user.id, items || []);
    res.status(200).json(new ApiResponse(200, wishlist, 'Wishlist synced successfully'));
  } catch (error) {
    next(error);
  }
};
