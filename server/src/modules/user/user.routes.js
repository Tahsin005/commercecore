import express from 'express';
import { signup, login } from './user.controller.js';
import { signupSchema, loginSchema } from './user.validation.js';
import validate from '../../middlewares/validate.middleware.js';

const router = express.Router();

router.post('/signup', validate(signupSchema), signup);
router.post('/login', validate(loginSchema), login);

export default router;
