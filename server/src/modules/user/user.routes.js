import express from 'express';
import { signup, login, claimAccount, getAdminUserStats } from './user.controller.js';
import { signupSchema, loginSchema, claimAccountSchema } from './user.validation.js';
import validate from '../../middlewares/validate.middleware.js';
import { authenticateToken, requireAdmin } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/signup', validate(signupSchema), signup);
router.post('/login', validate(loginSchema), login);
router.post('/claim-account', authenticateToken, validate(claimAccountSchema), claimAccount);
router.get('/admin', authenticateToken, requireAdmin, getAdminUserStats);

export default router;
