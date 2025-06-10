import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  jwtSecret: process.env.JWT_SECRET,
  jwtAccessTokenExpirationTime:
    process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME || '15m',
  adminApiKey: process.env.ADMIN_API_KEY,
  corsOrigin: process.env.CORS_ORIGIN || '*',
  defaultProfileImage:
    process.env.DEFAULT_PROFILE_IMAGE ||
    'https://res.cloudinary.com/ein39/image/upload/v1743629482/ServiceSphere/vryf9jmnqabuoo1c1aab.webp',
}));
