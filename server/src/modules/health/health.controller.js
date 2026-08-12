import { checkHealth } from './health.service.js';
import ApiResponse from '../../utils/ApiResponse.js';

export const getHealthStatus = async (req, res, next) => {
  try {
    const healthData = await checkHealth();
    res.status(200).json(
      new ApiResponse(200, healthData, 'Server health status retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};
