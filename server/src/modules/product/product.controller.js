import {
  getAllProductsService,
  getProductByIdService,
  getProductBySlugService,
  getProductVariantsService,
  getGlobalVariantsService,
} from './product.service.js';
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

export const getProductBySlug = async (req, res, next) => {
  try {
    const product = await getProductBySlugService(req.params.slug);
    res.status(200).json(new ApiResponse(200, product, 'Product details retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const getProductVariants = async (req, res, next) => {
  try {
    const variants = await getProductVariantsService(req.params.id);
    res.status(200).json(new ApiResponse(200, variants, 'Product variants retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const getGlobalVariants = async (req, res, next) => {
  try {
    const variants = await getGlobalVariantsService();
    res.status(200).json(new ApiResponse(200, variants, 'Global variants retrieved successfully'));
  } catch (error) {
    next(error);
  }
};
