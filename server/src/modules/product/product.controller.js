import { getAllProductsService, getProductByIdService } from './product.service.js';
import ApiResponse from '../../utils/ApiResponse.js';

export const getProducts = async (req, res, next) => {
  try {
    const products = await getAllProductsService(req.query);
    res.status(200).json(new ApiResponse(200, products, 'Products retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const getProductDetails = async (req, res, next) => {
  try {
    const product = await getProductByIdService(req.params.id);
    res.status(200).json(new ApiResponse(200, product, 'Product details retrieved successfully'));
  } catch (error) {
    next(error);
  }
};
