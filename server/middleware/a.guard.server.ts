const userDataRoute = '^/api/users(/.*)?$';
const protectedRoutes = [userDataRoute, '^/api/ai(/.*)?$'];

// EXPOSES event.context.user
export default defineEventHandler(async (event) => {
  const url = getRequestURL(event);
  const urlPath = url.pathname;

  if (LOG_BACKEND) console.info('urlPath', urlPath);

  let matchingRoute = null;
  const isProtected = protectedRoutes.some((route) => {
    const regex = new RegExp(route);
    if (regex.test(urlPath)) {
      matchingRoute = route;
      return true;
    }
    return false;
  });

  if (isProtected) {
    if (LOG_BACKEND) {
      console.info(`${event.node.req.headers["host"]} | ${event.node.req.headers["user-agent"]} accessing route:`, matchingRoute, urlPath);
    }

    const session = await requireUserSession(event); // should return error if no session
    event.context.user =
      session.user; /* Context is accessible in the route, that runs after the middleware. */
  }
});
