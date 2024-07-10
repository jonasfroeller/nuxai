import { migrate } from "drizzle-orm/postgres-js/migrator";
import { migrationClient } from "./db";

async function migrateDatabase() {
    const db = migrationClient();
    if (!db) return;

    await migrate(db, { migrationsFolder: "server/database/migrations" })
        .then(() => {
            console.log("Migrated database...");
        })
        .catch((e) => {
            console.error("Failed to migrate database:", e);
            throw createError({ statusCode: 500, statusMessage: 'Internal Server Error', message: 'Failed to migrate database', fatal: true });
        });
}

export default migrateDatabase;
