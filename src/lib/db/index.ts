import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http'
// cache connections that are being set
// neonConfig.fetchConnectionCache = true;

if (!process.env.DATABASE_URL) {
    throw new Error('database url not found');
}

const sql = neon(process.env.DATABASE_URL);

// this db variable is what we will use to interact with our database
// need schema file to define shape of our database
export const db = drizzle(sql);