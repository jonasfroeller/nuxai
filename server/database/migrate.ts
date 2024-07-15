import { connectionString, databaseMap, IS_SERVERLESS } from "./db";
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { Client as NeonPostgres } from '@neondatabase/serverless';
import { drizzle as neonDrizzle } from 'drizzle-orm/neon-serverless';
import { migrate as neonMigrate } from "drizzle-orm/neon-serverless/migrator";

async function migrateDatabase() {
    if (IS_SERVERLESS) {
        const migrationClient = new NeonPostgres(connectionString);

        const drizzleClient = neonDrizzle(migrationClient, {
            schema: databaseMap
        });

        await neonMigrate(drizzleClient, { migrationsFolder: "server/database/migrations" })
            .then(() => {
                console.log("Migrated database...");
            })
            .catch((e) => {
                console.error("Failed to migrate database:", e);
                throw createError({ statusCode: 500, statusMessage: 'Internal Server Error', message: 'Failed to migrate database', fatal: true });
            });
    }

    const migrationClient = postgres(connectionString, { max: 1 });

    const drizzleClient = drizzle(migrationClient, {
        schema: databaseMap
    });

    await migrate(drizzleClient, { migrationsFolder: "server/database/migrations" })
        .then(() => {
            console.log("Migrated database...");
        })
        .catch((e) => {
            console.error("Failed to migrate database:", e);
            throw createError({ statusCode: 500, statusMessage: 'Internal Server Error', message: 'Failed to migrate database', fatal: true });
        });
}

export default migrateDatabase;
