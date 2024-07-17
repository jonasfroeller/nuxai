const protectedRoutes = [
    "^\/api\/users(\/.*)?$",
    "^\/api\/ai(\/.*)?$"
];

export default defineEventHandler(async (event) => {
    const url = getRequestURL(event);
    const urlPath = url.pathname;

    const isProtected = protectedRoutes.some(route => {
        const regex = new RegExp(route);
        return regex.test(urlPath);
    });

    if (isProtected) {
        const session = await requireUserSession(event); // should return error if no session

        if (!session) { // just to be on the safe side
            return sendError(event, createError({ statusCode: 401, statusMessage: 'Unauthorized' }));
        }

        event.context.user = session.user; /* Context is accessible in the route, that runs after the middleware */
    }
});
