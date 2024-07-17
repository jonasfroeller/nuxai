export default defineNitroPlugin(() => {
    // update session, when fetched
    sessionHooks.hook('fetch', async (session, event) => {
        console.log("session fetched...");

        const loggedInAt = new Date();
        await replaceUserSession(event, {
            user: session.user,
            loggedInAt
        });

        console.log("session updated...");
    })

    sessionHooks.hook('clear', async (session, event) => {
        console.log("session cleared...");
    })
})
