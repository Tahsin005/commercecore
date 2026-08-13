import Category from './category.model.js';
import ApiError from '../../utils/ApiError.js';

export const getAllCategoriesService = async (query = {}) => {
  const filter = {};
  if (query.isFeatured !== undefined) {
    filter.isFeatured = query.isFeatured === 'true' || query.isFeatured === true;
  }
  return Category.find(filter).sort({ name: 1 });
};

export const getCategoryBySlugService = async (slug) => {
  const category = await Category.findOne({ slug });
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }
  return category;
};
