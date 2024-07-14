import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    schema: "./server/database/schema.ts",
    out: "./server/database/migrations",
    dialect: "postgresql",
    dbCredentials: {
        url: (process.env.DATABASE_CONNECTION_STRING || "postgresql://postgres:postgres@localhost:5432/postgres")
    },
    verbose: true
})
