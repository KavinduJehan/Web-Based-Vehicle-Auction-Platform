import dotenv from 'dotenv';

dotenv.config();

const config = {
  port: process.env.PORT || 3000,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  bcryptRounds: Number(process.env.BCRYPT_ROUNDS || 10),
  env: process.env.NODE_ENV || 'development',
  logFormat: process.env.NODE_ENV === 'production' ? 'combined' : 'dev'
};

export default config;
