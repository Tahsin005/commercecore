import { getAllCategoriesService, getCategoryBySlugService } from './category.service.js';
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
