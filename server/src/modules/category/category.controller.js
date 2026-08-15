import {
  getAllCategoriesService,
  getCategoryBySlugService,
  createCategoryService,
  updateCategoryService,
  deleteCategoryService,
} from './category.service.js';
import ApiResponse from '../../utils/ApiResponse.js';

export const getCategories = async (req, res, next) => {
  try {
    const categories = await getAllCategoriesService(req.query);
    res.status(200).json(new ApiResponse(200, categories, 'Categories retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const getCategoryDetails = async (req, res, next) => {
  try {
    const category = await getCategoryBySlugService(req.params.slug);
    res.status(200).json(new ApiResponse(200, category, 'Category details retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const category = await createCategoryService(req.body);
    res.status(201).json(new ApiResponse(201, category, 'Category created successfully'));
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const category = await updateCategoryService(req.params.id, req.body);
    res.status(200).json(new ApiResponse(200, category, 'Category updated successfully'));
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const category = await deleteCategoryService(req.params.id);
    res.status(200).json(new ApiResponse(200, category, 'Category deleted successfully'));
  } catch (error) {
    next(error);
  }
};
