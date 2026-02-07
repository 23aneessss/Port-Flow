import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: process.env.PORT ? Number(process.env.PORT) : 4000,
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || ''
};

if (!env.databaseUrl) {
  console.warn('DATABASE_URL is missing');
}
if (!env.jwtSecret) {
  console.warn('JWT_SECRET is missing');
}
