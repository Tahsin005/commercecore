import {
  getSeoByRouteService,
  getAllSeoMetaService,
  upsertSeoMetaService,
  deleteSeoMetaService,
} from './seo.service.js';
import ApiResponse from '../../utils/ApiResponse.js';

export const getSeoByRoute = async (req, res, next) => {
  try {
    const route = req.query.route || '/';
    const seo = await getSeoByRouteService(route);
    res.status(200).json(new ApiResponse(200, seo, 'SEO meta retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const getAllSeoMeta = async (req, res, next) => {
  try {
    const allSeo = await getAllSeoMetaService();
    res.status(200).json(new ApiResponse(200, allSeo, 'All SEO meta retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const upsertSeoMeta = async (req, res, next) => {
  try {
    const updatedSeo = await upsertSeoMetaService(req.body);
    res.status(200).json(new ApiResponse(200, updatedSeo, 'SEO meta saved successfully'));
  } catch (error) {
    next(error);
  }
};

export const deleteSeoMeta = async (req, res, next) => {
  try {
    const result = await deleteSeoMetaService(req.params.id);
    res.status(200).json(new ApiResponse(200, result, 'SEO meta deleted successfully'));
  } catch (error) {
    next(error);
  }
};
