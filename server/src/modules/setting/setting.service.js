import SiteSetting from './siteSetting.model.js';

let settingsCache = null;
let lastCacheFetchTime = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes TTL

export const DEFAULT_SETTINGS = {
  delivery_charge: {
    insideDhaka: 60,
    outsideDhaka: 120,
  },
  site_discount: {
    discountPercentage: 0,
    startDate: null,
    endDate: null,
    isActive: false,
  },
  marquee: {
    text: "Welcome to Rupzon Collection! Fast Cash-on-Delivery nationwide.",
    isActive: true,
  },
  footer_settings: {
    description: "Rupzon Collection is a premium full-stack e-commerce platform delivering high quality collections.",
    helpline: "01700000000",
    socialLinks: [],
  },
};

export const clearSettingsCache = () => {
  settingsCache = null;
  lastCacheFetchTime = 0;
};

export const getSiteSettingsService = async () => {
  const now = Date.now();
  if (settingsCache && now - lastCacheFetchTime < CACHE_TTL_MS) {
    return settingsCache;
  }

  const settingsDocs = await SiteSetting.find({});
  const result = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));

  settingsDocs.forEach((doc) => {
    result[doc.key] = doc.value;
  });

  settingsCache = result;
  lastCacheFetchTime = now;
  return settingsCache;
};

export const updateSiteSettingService = async (key, value) => {
  await SiteSetting.findOneAndUpdate(
    { key },
    { key, value },
    { upsert: true, returnDocument: 'after', runValidators: true }
  );

  clearSettingsCache();
  return getSiteSettingsService();
};
