import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import env from './config/env.js';
import logger from './utils/logger.js';
import routes from './routes/index.js';
import ApiError from './utils/ApiError.js';
import connectDB from './config/db.js';

const app = express();

// Ensure DB connection for incoming requests in serverless environments (Vercel)
app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (err) {
    logger.error(`Database connection middleware error: ${err.message}`);
  }
  next();
});

// Middlewares
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  })
);

// Morgan logger setup for HTTP requests
const morganFormat = env.nodeEnv === 'development' ? 'dev' : 'combined';
app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

// API Routes
app.use('/api/v1', routes);

// 404 handler
app.use((req, res, next) => {
  next(new ApiError(404, 'Not Found'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  logger.error(`${statusCode} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  if (err.stack) {
    logger.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors: err.errors || [],
    ...(env.nodeEnv === 'development' && { stack: err.stack }),
  });
});

export default app;
