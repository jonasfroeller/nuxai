import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { connectionString } from "./db";

const migrationClient = postgres(connectionString, { max: 1 });
async function migrateDatabase() {
    const db = drizzle(migrationClient);
    await migrate(db, { migrationsFolder: "server/database/migrations" });
}

export default migrateDatabase;
