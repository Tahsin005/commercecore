import { registerUser, loginUser, claimAccountService } from './user.service.js';
import ApiResponse from '../../utils/ApiResponse.js';

export const signup = async (req, res, next) => {
  try {
    const result = await registerUser(req.body);
    res
      .status(201)
      .json(new ApiResponse(201, result, 'User registered successfully'));
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const result = await loginUser(req.body);
    res
      .status(200)
      .json(new ApiResponse(200, result, 'User logged in successfully'));
  } catch (error) {
    next(error);
  }
};

export const claimAccount = async (req, res, next) => {
  try {
    const result = await claimAccountService(req.user.id, req.body);
    res
      .status(200)
      .json(new ApiResponse(200, result, 'Account claimed successfully with new password'));
  } catch (error) {
    next(error);
  }
};
