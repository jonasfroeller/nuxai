export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);
  console.info('current session', JSON.stringify(session));

  if (Object.keys(session).length !== 0) {
    console.info('clearing session...');

    return await clearUserSession(event);
  }

  console.info('no active session to clear...');
  return false;
});
