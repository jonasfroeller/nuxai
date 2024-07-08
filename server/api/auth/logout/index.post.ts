export default defineEventHandler(async (event) => {
    const session = await getUserSession(event)
    console.log("current session", JSON.stringify(session));

    if (Object.keys(session).length !== 0) {
        console.log("clearing session");

        return await clearUserSession(event)
    }

    console.log("no active session to clear");
    return false;
})
