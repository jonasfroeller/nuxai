import { defineNuxtPlugin } from "nuxt/app";
// import migrateDatabase from "~/server/database/migrate";

// run database migrations on nuxt ready, if in development mode
export default defineNuxtPlugin((nuxtApp) => {
    if (!IS_DEV) return;

    nuxtApp.hooks.hook("app:created", async () => { // Use package.json script for now.
        // TODO: find out, why this is blocking (i guess it is the database connection, but that should be closed finally)
        // await migrateDatabase();
    })
})
