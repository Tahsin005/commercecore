import { z } from 'zod';
import { getSiteSettingsService, updateSiteSettingService } from './setting.service.js';
import {
  deliveryChargeSchema,
  marqueeSchema,
  footerSettingsSchema,
} from './setting.validation.js';
import ApiResponse from '../../utils/ApiResponse.js';
import ApiError from '../../utils/ApiError.js';

const PUBLIC_SETTING_KEYS = ['delivery_charge', 'marquee', 'footer_settings'];

const settingSchemaMap = {
  delivery_charge: deliveryChargeSchema,
  marquee: marqueeSchema,
  footer_settings: footerSettingsSchema,
};

export const getSiteSettings = async (req, res, next) => {
  try {
    const settings = await getSiteSettingsService();
    const publicSettings = {};
    PUBLIC_SETTING_KEYS.forEach((key) => {
      if (settings[key] !== undefined) {
        publicSettings[key] = settings[key];
      }
    });
    res.status(200).json(new ApiResponse(200, publicSettings, 'Settings retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const updateSiteSetting = async (req, res, next) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    const schema = settingSchemaMap[key];
    if (!schema) {
      throw new ApiError(400, `Invalid or unsupported setting key '${key}'`);
    }

    const parsedValue = schema.parse(value);

    const updatedSettings = await updateSiteSettingService(key, parsedValue);
    res.status(200).json(new ApiResponse(200, updatedSettings, `Setting '${key}' updated successfully`));
  } catch (error) {
    if (error.name === 'ZodError' || error instanceof z.ZodError) {
      const issues = error.issues || error.errors || [];
      const fieldErrors = issues.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return next(new ApiError(400, 'Validation Error', fieldErrors));
    }
    next(error);
  }
};
