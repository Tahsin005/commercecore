import express from 'express';
import { getHealthStatus } from './health.controller.js';

const router = express.Router();

router.get('/', getHealthStatus);

export default router;
