const protectedRoutes = [
    "^/api/user(/|$)"  // matches "/api/user" and "/api/user/**"
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
    }
});