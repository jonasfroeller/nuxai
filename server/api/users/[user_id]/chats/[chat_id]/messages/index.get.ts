import { readChatConversationMessages } from '~/server/database/repositories/chatConversationMessages';

// Read all messages of chat conversation
export default defineEventHandler(async (event) => {
  const user_id = getRouterParam(event, 'user_id');
  const chat_id = getRouterParam(event, 'chat_id');

  /* TODO: validation */

  const fetchedChatMessages = await readChatConversationMessages(
    Number(chat_id)
  );

  return {
    chatMessages: fetchedChatMessages,
  };
});
