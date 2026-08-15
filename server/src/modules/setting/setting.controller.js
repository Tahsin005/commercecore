import { getSiteSettingsService, updateSiteSettingService } from './setting.service.js';
import {
  deliveryChargeSchema,
  siteDiscountSchema,
  marqueeSchema,
  footerSettingsSchema,
} from './setting.validation.js';
import ApiResponse from '../../utils/ApiResponse.js';
import ApiError from '../../utils/ApiError.js';

export const getSiteSettings = async (req, res, next) => {
  try {
    const settings = await getSiteSettingsService();
    res.status(200).json(new ApiResponse(200, settings, 'Settings retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const updateSiteSetting = async (req, res, next) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    let parsedValue = value;
    if (key === 'delivery_charge') {
      parsedValue = deliveryChargeSchema.parse(value);
    } else if (key === 'site_discount') {
      parsedValue = siteDiscountSchema.parse(value);
    } else if (key === 'marquee') {
      parsedValue = marqueeSchema.parse(value);
    } else if (key === 'footer_settings') {
      parsedValue = footerSettingsSchema.parse(value);
    }

    const updatedSettings = await updateSiteSettingService(key, parsedValue);
    res.status(200).json(new ApiResponse(200, updatedSettings, `Setting '${key}' updated successfully`));
  } catch (error) {
    if (error.name === 'ZodError') {
      const fieldErrors = error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return next(new ApiError(400, 'Validation Error', fieldErrors));
    }
    next(error);
  }
};
