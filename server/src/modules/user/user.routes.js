import express from 'express';
import { signup, login, claimAccount, getAdminUserStats, updateProfile, changePassword, getMe } from './user.controller.js';
import { signupSchema, loginSchema, claimAccountSchema, updateProfileSchema, changePasswordSchema } from './user.validation.js';
import validate from '../../middlewares/validate.middleware.js';
import { authenticateToken, requireAdmin } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/me', authenticateToken, getMe);
router.post('/signup', validate(signupSchema), signup);
router.post('/login', validate(loginSchema), login);
router.post('/claim-account', authenticateToken, validate(claimAccountSchema), claimAccount);
router.get('/admin', authenticateToken, requireAdmin, getAdminUserStats);

router.put('/profile', authenticateToken, validate(updateProfileSchema), updateProfile);
router.put('/change-password', authenticateToken, validate(changePasswordSchema), changePassword);

export default router;

