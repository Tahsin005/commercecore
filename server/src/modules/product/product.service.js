import Product from './product.model.js';
import Category from '../category/category.model.js'; // Registers Category schema with Mongoose for populate
import ApiError from '../../utils/ApiError.js';

export const getAllProductsService = async (query = {}) => {
  const filter = {};
  if (query.categoryId) {
    filter.categoryId = query.categoryId;
  }
  return Product.find(filter).populate('categoryId', 'name slug').sort({ createdAt: -1 });
};

export const getProductByIdService = async (productId) => {
  const product = await Product.findById(productId).populate('categoryId', 'name slug');
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }
  return product;
};
