import dotenv from 'dotenv';
dotenv.config();

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT || 3000),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: required('DATABASE_URL'),
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  jwtAccessSecret: required('JWT_ACCESS_SECRET', 'dev-access-secret'),
  jwtRefreshSecret: required('JWT_REFRESH_SECRET', 'dev-refresh-secret'),
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  credentialsEncKey: required(
    'CREDENTIALS_ENC_KEY',
    '0000000000000000000000000000000000000000000000000000000000000'
  ),
};
