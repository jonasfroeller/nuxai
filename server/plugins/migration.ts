/* import { onNuxtReady } from "nuxt/app" */
/* import migrateDatabase from "../database/migrate"; */

// run database migrations on nuxt ready, if in development mode
export default defineNitroPlugin(() => {
    if (!IS_DEV) return;

    // TODO: alternative hook, that is available on the server
    /* onNuxtReady(async () => { // causes: "Vue app aliases are not allowed in server runtime."
        await migrateDatabase();
    }) */
})
