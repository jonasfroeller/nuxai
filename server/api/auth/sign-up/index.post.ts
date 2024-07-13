import { createUser, readUserUsingPrimaryEmail } from "~/server/database/repositories/users";

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

    /* 1. VALIDATE INPUT */
    const body = await readBody(event);
    console.info("body", body);

    const { email, password } = body;

    if (!email || !password) { /* TODO: improve with zod, also add feedback before on frontend using zod */
        console.warn("missing email or password");
        return sendError(event, createError({ statusCode: 400, statusMessage: 'Bad Request' }));
    }

    /* 2. CHECK IF USER EXISTS */

    const userExists = await readUserUsingPrimaryEmail(email);
    console.info("userExists:", userExists);

    if (userExists) {
        console.warn("user already exists");
        return sendError(event, createError({ statusCode: 409, statusMessage: 'Conflict' }));
    }

    /* 3. CREATE NEW USER */

    const userToCreate = {
        primary_email: email,
        password
    }

    const createdUser = await createUser(userToCreate);

    if (!createdUser) {
        console.warn("failed to create user");
        return sendError(event, createError({ statusCode: 500, statusMessage: 'Internal Server Error' }));
    }

    /* 4. CREATE NEW SESSION */

    const user = {
        id: createdUser.id,
        primary_email: createdUser.primary_email
    }

    const loggedInAt = new Date();
    console.log("setting new session");

    return await setUserSession(event, {
        user,
        loggedInAt
    })
})
