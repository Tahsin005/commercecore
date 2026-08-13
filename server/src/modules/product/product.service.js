import Product, { ProductVariant } from './product.model.js';
import Category from '../category/category.model.js'; // Registers Category schema with Mongoose
import ApiError from '../../utils/ApiError.js';

export const getAllProductsService = async (query = {}) => {
  const filter = {};
  if (query.categoryId) {
    filter.categoryId = query.categoryId;
  }
  if (query.isFeatured !== undefined) {
    filter.isFeatured = query.isFeatured === 'true' || query.isFeatured === true;
  }
  if (query.isActive !== undefined) {
    filter.isActive = query.isActive === 'true' || query.isActive === true;
  }

  const products = await Product.find(filter)
    .populate('categoryId', 'name slug isFeatured')
    .sort({ createdAt: -1 });

  return products;
};

export const getProductByIdService = async (productId) => {
  const product = await Product.findById(productId).populate('categoryId', 'name slug isFeatured');
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }
  const variants = await ProductVariant.find({ productId: product.id });
  return {
    ...product.toJSON(),
    variants,
  };
};

export const getProductBySlugService = async (slug) => {
  const product = await Product.findOne({ slug }).populate('categoryId', 'name slug isFeatured');
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }
  const variants = await ProductVariant.find({ productId: product.id });
  return {
    ...product.toJSON(),
    variants,
  };
};

export const getProductVariantsService = async (productId) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }
  return ProductVariant.find({ productId });
};
