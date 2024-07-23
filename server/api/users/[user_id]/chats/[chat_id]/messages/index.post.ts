import type { Message } from 'ai';
import { createChatConversationMessages } from '~/server/database/repositories/chatConversationMessages';

// Read all messages of chat conversation
export default defineEventHandler(async (event) => {
  const user_id = getRouterParam(event, 'user_id');
  const chat_id = getRouterParam(event, 'chat_id');

  /* TODO: validation */

  const data = await readBody(event);
  const { messages: rawMessages } = data;

  if (!Array.isArray(rawMessages)) {
    const { message, actor } = data;

    const conversationMessageToCreate = {
      message: String(message),
      actor: String(actor),
      chat_user_id: Number(user_id),
      chat_conversation_id: Number(chat_id),
    };

    const createdMessage = await createChatConversationMessages([
      conversationMessageToCreate,
    ]);

    return {
      chatMessage: createdMessage,
    };
  }

  const messages = (rawMessages as Message[]).map(({ content, role }) => ({
    message: content,
    actor: role,
    chat_user_id: Number(user_id),
    chat_conversation_id: Number(chat_id),
  }));

  const createdMessages = await createChatConversationMessages(messages);

  return {
    chatMessages: createdMessages,
  };
});
