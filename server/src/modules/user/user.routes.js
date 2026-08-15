import express from 'express';
import { signup, login, claimAccount } from './user.controller.js';
import { signupSchema, loginSchema, claimAccountSchema } from './user.validation.js';
import validate from '../../middlewares/validate.middleware.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/signup', validate(signupSchema), signup);
router.post('/login', validate(loginSchema), login);
router.post('/claim-account', authenticateToken, validate(claimAccountSchema), claimAccount);

export default router;
