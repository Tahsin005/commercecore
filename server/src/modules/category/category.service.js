import Category from './category.model.js';
import Product from '../product/product.model.js';
import ApiError from '../../utils/ApiError.js';

const generateSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

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

export const createCategoryService = async ({ name, slug, isFeatured = false, imageUrl = '' }) => {
  const finalSlug = generateSlug(slug || name);
  if (!finalSlug) {
    throw new ApiError(400, 'Invalid category name or slug');
  }

  const existing = await Category.findOne({ slug: finalSlug });
  if (existing) {
    throw new ApiError(400, 'Category with this slug already exists');
  }

  const category = await Category.create({
    name,
    slug: finalSlug,
    isFeatured: Boolean(isFeatured),
    imageUrl: imageUrl ? imageUrl.trim() : '',
  });

  return category;
};

export const updateCategoryService = async (id, { name, slug, isFeatured, imageUrl }) => {
  const category = await Category.findById(id);
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  if (name !== undefined) category.name = name;
  if (isFeatured !== undefined) category.isFeatured = Boolean(isFeatured);
  if (imageUrl !== undefined) category.imageUrl = imageUrl.trim();

  if (slug !== undefined || name !== undefined) {
    const candidateSlug = generateSlug(slug || category.name);
    if (candidateSlug !== category.slug) {
      const existing = await Category.findOne({ slug: candidateSlug, _id: { $ne: id } });
      if (existing) {
        throw new ApiError(400, 'Category with this slug already exists');
      }
      category.slug = candidateSlug;
    }
  }

  await category.save();
  return category;
};

export const deleteCategoryService = async (id) => {
  const category = await Category.findById(id);
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  const productsCount = await Product.countDocuments({ categoryId: id });
  if (productsCount > 0) {
    throw new ApiError(400, `Cannot delete category: ${productsCount} product(s) are assigned to it.`);
  }

  await Category.deleteOne({ _id: id });
  return category;
};
