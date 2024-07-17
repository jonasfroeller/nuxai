import { onNuxtReady } from "nuxt/app"
import migrateDatabase from "../database/migrate";

// run database migrations on nuxt ready, if in development mode
export default defineNitroPlugin(() => {
    if (!IS_DEV) return;

    onNuxtReady(async () => {
        await migrateDatabase();
    })
})
