import { createChatConversationMessage } from "~/server/database/repositories/chatConversationMessages";

// Read all messages of chat conversation
export default defineEventHandler(async (event) => {
  const user_id = getRouterParam(event, 'user_id');
  const chat_id = getRouterParam(event, 'chat_id');

  /* TODO: validation */

  const { message } = await readBody(event);
  const conversationMessageToCreate = {
    message: String(message),
    chat_user_id: Number(user_id),
    chat_conversation_id: Number(chat_id),
  }

  const createdMessage = await createChatConversationMessage(conversationMessageToCreate)

  return {
    chatMessage: createdMessage
  };
});
