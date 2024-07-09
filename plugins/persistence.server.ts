export default defineNuxtPlugin(() => { })

/* import { db } from "~/server/orm/db";

export default defineNuxtPlugin({
    name: 'db',
    enforce: 'pre', // or 'post'
    async setup(_nuxtApp) {
        return {
            provide: {
                db: db
            }
        }
    },
    hooks: {
        'app:created'() {
            const nuxtApp = useNuxtApp()
            // do something in the hook
        }
    },
    env: {}
}) */
