import connectDB from '../config/db.js';
import UploadConfig from '../modules/upload/uploadConfig.model.js';
import logger from '../utils/logger.js';

const createUploadConfigs = async () => {
  try {
    const rawArgs = process.argv.slice(2).join(',');
    if (!rawArgs || !rawArgs.trim()) {
      logger.error('Usage: node src/scripts/create-upload-config.js <url1,url2,...>');
      logger.error('Example: node src/scripts/create-upload-config.js "cloudinary://key1:secret1@cloud1,cloudinary://key2:secret2@cloud2"');
      process.exit(1);
    }

    // Split URLs by comma or space and filter out empty entries
    const urls = rawArgs
      .split(/[\s,]+/)
      .map((u) => u.trim())
      .filter(Boolean);

    if (urls.length === 0) {
      logger.error('No valid upload connection URLs provided.');
      process.exit(1);
    }

    logger.info('Connecting to MongoDB...');
    await connectDB();

    logger.info(`Processing ${urls.length} upload configuration URL(s)...`);

    const created = [];
    let index = 1;
    for (const uploadUrl of urls) {
      const config = await UploadConfig.create({
        name: `Upload Account ${index}`,
        uploadUrl,
        load: 0,
        isActive: true,
      });
      logger.info(`Successfully created UploadConfig [${config._id}]: Upload Account ${index}`);
      created.push(config);
      index++;
    }

    logger.info(`Done! ${created.length} UploadConfig record(s) created successfully.`);
    process.exit(0);
  } catch (error) {
    logger.error(`Failed to create UploadConfig: ${error.message}`);
    process.exit(1);
  }
};

createUploadConfigs();
