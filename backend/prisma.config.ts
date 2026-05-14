import { defineConfig } from 'prisma/config';
import * as dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in .env');
}

export default defineConfig({
  datasource: {
    url: DATABASE_URL,
  },
});
