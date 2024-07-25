import type { ChatConversationToCreate } from '~/lib/types/database.tables/schema';
import {
  createChatConversation,
  readAllChatConversationsOfUser,
} from '~/server/database/repositories/chatConversations';

export default defineEventHandler(async (event) => {
  /* 0. VALIDATE METHOD */
  assertMethod(event, ['POST', 'GET']);

  /* 1. GET METHOD AND QUERY PARAMETERS */
  const method = event.node.req.method;

  const maybeUserId = await validateUserId(event);
  if (maybeUserId.statusCode !== 200) {
    return sendError(
      event,
      createError({
        statusCode: maybeUserId.statusCode,
        statusMessage: maybeUserId.statusMessage,
        data: maybeUserId.data,
      })
    );
  }
  const user_id = maybeUserId.data?.user_id;

  /* 2. VALIDATE BODY(model, name) */
  if (method === 'POST') {
    const body = await readValidatedBody(event, (body) =>
      ChatConversationToCreateSchema.safeParse(body)
    );
    if (!body.success || !body.data) {
      return sendError(
        event,
        createError({
          statusCode: 400,
          statusMessage: 'Bad Request. Invalid body(model, name).',
          data: body.error,
        })
      );
    }
    const validatedBody = body.data;
    const { model, name } = validatedBody;

    /* 3.1 CREATE NEW CHAT(model, name) */
    if (LOG_BACKEND) console.info(`creating new chat (${validatedBody})...`);

    const chatToCreate: ChatConversationToCreate = {
      chat_user_id: user_id,
      model,
      name,
    };

    const createdChatConversation = await createChatConversation(chatToCreate);

    return {
      chat: createdChatConversation,
    };
  } else {
    /* 3.2 READ ALL CHATS */
    if (LOG_BACKEND) console.info(`fetching all chats of user ${user_id}...`);

    const fetchedChatConversations =
      await readAllChatConversationsOfUser(user_id);

    return {
      chats: fetchedChatConversations,
    };
  }
});

/* $fetch("/api/users/:user_id/chats/:chat_id") => DOESN'T EVEN MAKE A REQUEST, IF USED ON THE SERVER, IT JUST EXECUTES THE FUNCTION. Nuxt is so sick */
/* defineCachedEventHandler serves the old response and the evaluates the new one */
/* null as response => No Content. BRILLIANT! */
