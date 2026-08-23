import dotenv from 'dotenv';
dotenv.config();

const env = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET || 'fallback_secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1000d',
  adminEmails: process.env.ADMIN_EMAILS || 'admin@gmail.com',
  clientUrl: process.env.CLIENT_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://rupzoncollection.com',
  fbPixelId: process.env.FB_PIXEL_ID || '1738010567468201',
  fbCapiAccessToken: process.env.FB_CAPI_ACCESS_TOKEN || '',
  fbTestEventCode: process.env.FB_TEST_EVENT_CODE || '',
  fbApiVersion: process.env.FB_API_VERSION || 'v20.0',
};

export default env;
