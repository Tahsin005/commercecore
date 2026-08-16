import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import ApiError from '../utils/ApiError.js';
import User from '../modules/user/user.model.js';

// strict authentication middleware. Requires valid Bearer JWT token.
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Authentication token required');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.jwtSecret);

    const user = await User.findById(decoded.id).select('+password');
    if (!user) {
      throw new ApiError(401, 'User not found or session invalid');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Invalid or expired token'));
    }
    next(error);
  }
};

// admin check middleware. Requires req.user to exist and have isAdmin === true.
export const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return next(new ApiError(403, 'Access denied. Admin privileges required.'));
  }
  next();
};

// optional authentication middleware. Attaches req.user if valid token present, but allows unauthenticated requests to pass through.
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, env.jwtSecret);
      const user = await User.findById(decoded.id).select('+password');
      if (user) {
        req.user = user;
      }
    }
  } catch (err) {
    // ignore invalid tokens for optional auth
    req.user = null;
  }
  next();
};
