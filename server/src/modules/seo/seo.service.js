import SeoMeta from './seo.model.js';
import ApiError from '../../utils/ApiError.js';

let seoCache = new Map();
let lastCacheReset = Date.now();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes TTL

export const clearSeoCache = () => {
  seoCache.clear();
  lastCacheReset = Date.now();
};

export const getSeoByRouteService = async (route) => {
  const normalizedRoute = route.toLowerCase().startsWith('/')
    ? route.toLowerCase()
    : `/${route.toLowerCase()}`;

  const now = Date.now();
  if (now - lastCacheReset > CACHE_TTL_MS) {
    seoCache.clear();
    lastCacheReset = now;
  }

  if (seoCache.has(normalizedRoute)) {
    return seoCache.get(normalizedRoute);
  }

  const meta = await SeoMeta.findOne({ route: normalizedRoute });
  const result = meta ? meta.toJSON() : null;

  seoCache.set(normalizedRoute, result);
  return result;
};

export const getAllSeoMetaService = async () => {
  const allMeta = await SeoMeta.find({}).sort({ route: 1 });
  return allMeta.map((doc) => doc.toJSON());
};

export const upsertSeoMetaService = async (seoData) => {
  const { route, ...rest } = seoData;
  const normalizedRoute = route.toLowerCase().startsWith('/')
    ? route.toLowerCase()
    : `/${route.toLowerCase()}`;

  const updatedMeta = await SeoMeta.findOneAndUpdate(
    { route: normalizedRoute },
    { route: normalizedRoute, ...rest },
    { upsert: true, returnDocument: 'after', runValidators: true }
  );

  clearSeoCache();
  return updatedMeta.toJSON();
};

export const deleteSeoMetaService = async (id) => {
  const deleted = await SeoMeta.findByIdAndDelete(id);
  if (!deleted) {
    throw new ApiError(404, 'SEO meta entry not found');
  }

  clearSeoCache();
  return { message: 'SEO meta entry deleted successfully' };
};
