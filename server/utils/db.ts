import * as schema from '../database/schema';
import * as relations from '../database/relations';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { Client as NeonPostgres } from '@neondatabase/serverless';
import { drizzle as neonDrizzle } from 'drizzle-orm/neon-serverless';
import { IS_DEV } from './globals'; // needed, if run as package.json script

/* TODO: set the drivers as optional dependencies and only import the needed one dynamically (might be a worse idea, than leaving it like this) */

export const connectionString = process.env.DATABASE_CONNECTION_STRING || "postgresql://postgres:postgres@localhost:5432/postgres";
export const IS_SERVERLESS = Boolean(process.env.IS_SERVERLESS) ?? false; /* process.env.DATABASE_CONNECTION_STRING?.includes("neon.tech") && !IS_DEV (serverless doesn't work in a serverless environment and times out :|) */
export const databaseMap = {
    ...schema,
    ...relations
}

export const db = IS_SERVERLESS ? neonDrizzle(new NeonPostgres(connectionString), {
    schema: databaseMap,
    logger: IS_DEV
}) : drizzle(postgres(connectionString), {
    schema: databaseMap,
    logger: IS_DEV
});

/* export const db = () => {
    try {
        const getCorrectClient = () => {
            if (IS_SERVERLESS) {
                const client = new NeonPostgres(connectionString);
                return neonDrizzle(client, {
                    schema: databaseMap,
                    logger: IS_DEV
                });
            }

            const client = postgres(connectionString);
            return drizzle(client, {
                schema: databaseMap,
                logger: IS_DEV
            });
        }

        return getCorrectClient();
    } catch (e) {
        console.error("Failed to create drizzle instance:", e);
        throw createError({ statusCode: 500, statusMessage: 'Internal Server Error', message: 'Failed to create drizzle instance' });
    }
} */
