import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';
import * as relations from './relations';
import postgres from 'postgres';

export const connectionString = process.env.DATABASE_CONNECTION_STRING || "postgresql://postgres:postgres@localhost:5432/postgres";

export const migrationClient = () => {
    try {
        const migrationClient = postgres(connectionString, { max: 1 });
        const db = drizzle(migrationClient, {
            schema: {
                ...schema,
                ...relations
            }
        });
        return db;
    } catch (e) {
        console.error("Failed to create database migration client:", e);
        throw createError({ statusCode: 500, statusMessage: 'Internal Server Error', message: 'Failed to create database migration client' });
    }
}

export const queryClient = () => {
    try {
        return postgres(connectionString);
    } catch (e) {
        console.error("Failed to create database client:", e);
        throw createError({ statusCode: 500, statusMessage: 'Internal Server Error', message: 'Failed to create database client' });
    }
}

export const db = () => {
    try {
        const client = queryClient();
        if (!client) return;
        return drizzle(client, {
            schema: {
                ...schema,
                ...relations
            },
            logger: true
        });
    } catch (e) {
        console.error("Failed to create drizzle instance:", e);
        throw createError({ statusCode: 500, statusMessage: 'Internal Server Error', message: 'Failed to create drizzle instance' });
    }
}
