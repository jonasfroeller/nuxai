export default defineEventHandler(async (event) => {
    /* return sendError(event, createError({ statusCode: 401, statusMessage: 'Unauthorized' })); */

    // TODO: validate user and then sign in afterwards
    const user = {
        id: "3543523234",
        email: "some@email.com"
    }

    const loggedInAt = new Date();
    const session = await getUserSession(event)
    console.log("current session", JSON.stringify(session));

    if (Object.keys(session).length !== 0) {
        console.log("replacing session");

        return await replaceUserSession(event, {
            user,
            loggedInAt
        })
    }

    console.log("setting new session");

    return await setUserSession(event, {
        user,
        loggedInAt
    })
})
