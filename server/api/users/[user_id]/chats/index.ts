import {
  type ChatConversationToCreate,
  createChatConversation,
  readAllChatConversationsOfUser,
} from '~/server/database/repositories/chatConversations';
import { ChatConversationToCreateSchema } from '~/server/utils/validators';

export default defineEventHandler(async (event) => {
  assertMethod(event, ['POST', 'GET']);

  const method = event.node.req.method;
  const has_user_id = getRouterParam(event, 'user_id');

  if (!has_user_id)
    return sendError(
      event,
      createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        data: 'Missing user_id',
      }),
    );

  const paramValidationResults = await getValidatedRouterParams(
    event,
    (params) => {
      // @ts-ignore
      const user_id = Number(params?.user_id); // => NaN if not a number

      return UserIdSchema.safeParse({
        // check if user_id is a valid user_id
        user_id,
      });
    },
  );

  if (!paramValidationResults.success || !paramValidationResults.data)
    return sendError(
      event,
      createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        data: paramValidationResults.error,
      }),
    );
  const user_id = paramValidationResults.data!.user_id;

  const session = await requireUserSession(event);
  if (session.user.id !== user_id)
    return sendError(
      event,
      createError({ statusCode: 401, statusMessage: 'Unauthorized' }),
    );

  if (method === 'POST') {
    // Create new Chat conversation
    if (LOG_BACKEND) console.info('creating new chat...');

    const result = await readValidatedBody(event, (body) =>
      ChatConversationToCreateSchema.safeParse(body),
    );

    if (LOG_BACKEND) console.info('result', JSON.stringify(result));
    if (!result.success || !result.data)
      return sendError(
        event,
        createError({
          statusCode: 400,
          statusMessage: 'Bad Request',
          data: result.error,
        }),
      );
    const body = result.data!;

    if (LOG_BACKEND) console.info('body', body);

    const { model, name } = body;

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
    // Read all chat conversations of user
    if (LOG_BACKEND) console.info('fetching chat information...');

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
