import SiteSetting from './siteSetting.model.js';

let settingsCache = null;

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
    text: "Welcome to CommerceCore! Fast Cash-on-Delivery nationwide.",
    isActive: true,
  },
  footer_settings: {
    description: "CommerceCore is a premium full-stack e-commerce platform delivering high quality collections.",
    helpline: "01700000000",
    socialLinks: [],
  },
};

export const clearSettingsCache = () => {
  settingsCache = null;
};

export const getSiteSettingsService = async () => {
  if (settingsCache) {
    return settingsCache;
  }

  const settingsDocs = await SiteSetting.find({});
  const result = { ...DEFAULT_SETTINGS };

  settingsDocs.forEach((doc) => {
    result[doc.key] = doc.value;
  });

  settingsCache = result;
  return settingsCache;
};

export const updateSiteSettingService = async (key, value) => {
  await SiteSetting.findOneAndUpdate(
    { key },
    { key, value },
    { upsert: true, new: true, runValidators: true }
  );

  clearSettingsCache();
  return getSiteSettingsService();
};
