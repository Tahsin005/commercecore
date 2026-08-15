import express from 'express';
import { getSiteSettings, updateSiteSetting } from './setting.controller.js';
import { updateSettingSchema } from './setting.validation.js';
import validate from '../../middlewares/validate.middleware.js';
import { authenticateToken, requireAdmin } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', getSiteSettings);
router.put('/admin/:key', authenticateToken, requireAdmin, validate(updateSettingSchema), updateSiteSetting);

export default router;
