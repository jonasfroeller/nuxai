import { validateUserCredentials } from "~/server/database/repositories/users";

export default defineEventHandler(async (event) => {
    /* 0. CHECK IF USER IS ALREADY LOGGED IN => UPDATE SESSION */
    const session = await getUserSession(event)
    console.log("current session", JSON.stringify(session));

    if (Object.keys(session).length !== 0) {
        const loggedInAt = new Date();
        console.log("replacing session");

        return await replaceUserSession(event, {
            user: session.user,
            loggedInAt
        })
    }

    /* $fetch("/api/users/:user_id/chats/:chat_id") => DOESN'T EVEN MAKE A REQUEST, IF USED ON THE SERVER, IT JUST EXECUTES THE FUNCTION. Nuxt is so sick */
    /* defineCachedEventHandler serves the old response and the evaluates the new one */
    /* null as response => No Content. BRILLIANT! */
    /* assertMethod(event, ['POST', 'GET']) */

    /* 1. VALIDATE INPUT */
    const body = await readBody(event);
    console.info("body", body);

    const { email, password } = body;

    if (!email || !password) { /* TODO: improve with zod, also add feedback before on frontend using zod */
        console.warn("missing email or password");
        return sendError(event, createError({ statusCode: 400, statusMessage: 'Bad Request' }));
    }

    /* 2. CHECK IF USER IS VALID */

    const userIsValid = await validateUserCredentials(email, password);
    console.info("userIsValid:", userIsValid);

    if (!userIsValid) {
        console.warn("invalid credentials");
        return sendError(event, createError({ statusCode: 401, statusMessage: 'Unauthorized' }));
    }

    /* 3. CREATE NEW SESSION */

    const user = {
        id: userIsValid.id,
        primary_email: userIsValid.primary_email
    }

    const loggedInAt = new Date();
    console.log("setting new session");

    return await setUserSession(event, {
        user,
        loggedInAt
    })
})
