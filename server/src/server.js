import app from './app.js';
import env from './config/env.js';
import logger from './utils/logger.js';
import connectDB from './config/db.js';
import { ensureUniqueProductVariantLinks } from './modules/product/productVariantLink.model.js';

const startServer = async () => {
  try {
    await connectDB();
    await ensureUniqueProductVariantLinks();

    const server = app.listen(env.port, () => {
      logger.info(`Server is running on port ${env.port} in ${env.nodeEnv} mode`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      logger.error(`Unhandled Rejection: ${err.message}`);
      // Close server & exit process
      server.close(() => process.exit(1));
    });
  } catch (error) {
    logger.error(`Failed to start the server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
