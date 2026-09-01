import SeoMeta, { DEFAULT_SEO_ROUTES } from './seo.model.js';
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
  if (meta) {
    const result = meta.toJSON();
    seoCache.set(normalizedRoute, result);
    return result;
  }

  // Fallback to default route configuration if not customized in DB
  const defaultMeta = DEFAULT_SEO_ROUTES.find((def) => def.route === normalizedRoute);
  if (defaultMeta) {
    const result = { id: defaultMeta.route, ...defaultMeta };
    seoCache.set(normalizedRoute, result);
    return result;
  }

  seoCache.set(normalizedRoute, null);
  return null;
};

export const getAllSeoMetaService = async () => {
  const dbMetas = await SeoMeta.find({}).sort({ route: 1 });
  const dbMap = new Map(dbMetas.map((doc) => [doc.route, doc.toJSON()]));

  // Merge default routes with database overrides
  const result = [];
  for (const def of DEFAULT_SEO_ROUTES) {
    if (dbMap.has(def.route)) {
      result.push(dbMap.get(def.route));
      dbMap.delete(def.route);
    } else {
      result.push({ id: def.route, isDefault: true, ...def });
    }
  }

  // Append any additional custom routes created in DB
  for (const extra of dbMap.values()) {
    result.push(extra);
  }

  return result;
};

export const seedDefaultSeoRecordsService = async () => {
  const ops = DEFAULT_SEO_ROUTES.map((item) => ({
    updateOne: {
      filter: { route: item.route },
      update: { $setOnInsert: item },
      upsert: true,
    },
  }));

  if (ops.length > 0) {
    await SeoMeta.bulkWrite(ops);
    clearSeoCache();
  }
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
