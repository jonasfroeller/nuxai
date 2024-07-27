// Update chat message of chat conversation (TODO: only allow to edit last message => don't forget to trigger new ai request)
export default defineEventHandler(async (event) => {
  /* VALIDATE PARAMS */
  const maybeMessageId = await validateParamMessageId(event);
  if (maybeMessageId.statusCode !== 200) {
    return sendError(
      event,
      createError({
        statusCode: maybeMessageId.statusCode,
        statusMessage: maybeMessageId.statusMessage,
        data: maybeMessageId.data,
      })
    );
  }
  const user_id = maybeMessageId.data?.user_id;
  const chat_id = maybeMessageId.data?.chat_id;
  const message_id = maybeMessageId.data?.message_id;

  // TODO: implement actual logic

  return {
    user_id,
    chat_id,
    message_id,
  };
});
