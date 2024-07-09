import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './migrations/schema';
import postgres from 'postgres';

export const connectionString = process.env.DATABASE_CONNECTION_STRING || "postgresql://postgres:postgres@localhost:5432/postgres";

export const queryClient = postgres(connectionString);
export const db = drizzle(queryClient, { schema });
