import {
  getAllProductsService,
  getProductByIdService,
  getProductBySlugService,
  getProductVariantsService,
  getGlobalVariantsService,
  createProductService,
  updateProductService,
  deleteProductService,
  createGlobalVariantService,
  updateGlobalVariantService,
  deleteGlobalVariantService,
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
    const requestedIncludeAll = req.query.includeAll === 'true' || req.query.includeAll === true;
    const includeAll = requestedIncludeAll && Boolean(req.user && req.user.isAdmin);
    const variants = await getGlobalVariantsService(includeAll);
    res.status(200).json(new ApiResponse(200, variants, 'Global variants retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

// Admin Handlers
export const createProduct = async (req, res, next) => {
  try {
    const product = await createProductService(req.body);
    res.status(201).json(new ApiResponse(201, product, 'Product created successfully'));
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const product = await updateProductService(req.params.id, req.body);
    res.status(200).json(new ApiResponse(200, product, 'Product updated successfully'));
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await deleteProductService(req.params.id);
    res.status(200).json(new ApiResponse(200, product, 'Product deleted successfully'));
  } catch (error) {
    next(error);
  }
};

export const createGlobalVariant = async (req, res, next) => {
  try {
    const variant = await createGlobalVariantService(req.body);
    res.status(201).json(new ApiResponse(201, variant, 'Product variant created successfully'));
  } catch (error) {
    next(error);
  }
};

export const updateGlobalVariant = async (req, res, next) => {
  try {
    const variant = await updateGlobalVariantService(req.params.id, req.body);
    res.status(200).json(new ApiResponse(200, variant, 'Product variant updated successfully'));
  } catch (error) {
    next(error);
  }
};

export const deleteGlobalVariant = async (req, res, next) => {
  try {
    const variant = await deleteGlobalVariantService(req.params.id);
    res.status(200).json(new ApiResponse(200, variant, 'Product variant deleted successfully'));
  } catch (error) {
    next(error);
  }
};
