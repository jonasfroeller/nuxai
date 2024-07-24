import { chat_conversation_message, type ChatConversationMessageToCreate, type GetChatConversation, type GetChatConversationMessage } from '../../../lib/types/database.tables/schema';
import { eq } from 'drizzle-orm';
// import { ENCRYPTION_SECRET } from "~/server/utils/globals"; // TODO: maybe encrypt chat conversations

export const createChatConversationMessages = async (
  messages: ChatConversationMessageToCreate[]
) => {
  const createdChatConversationMessage = await db
    .insert(chat_conversation_message)
    .values(messages)
    .returning()
    .catch((err) => {
      if (LOG_BACKEND)
        console.error(
          'Failed to insert chat conversation message into database',
          err
        );
      return null;
    });

  if (!createdChatConversationMessage) return null;

  return createdChatConversationMessage[0];
};

export const readChatConversationMessage = async (
  id: GetChatConversationMessage['id']
) => {
  const chatConversationMessage = await db
    .select()
    .from(chat_conversation_message)
    .where(eq(chat_conversation_message.id, id))
    .catch((err) => {
      if (LOG_BACKEND)
        console.error(
          'Failed to read chat conversation message from database',
          err
        );
      return null;
    });

  if (!chatConversationMessage) return null;

  return chatConversationMessage[0];
};

export const readChatConversationMessages = async (
  chat_conversation_id: GetChatConversation['id']
) => {
  const chatConversationMessages = await db
    .select()
    .from(chat_conversation_message)
    .where(
      eq(chat_conversation_message.chat_conversation_id, chat_conversation_id)
    )
    .catch((err) => {
      if (LOG_BACKEND)
        console.error(
          'Failed to read chat conversation messages from database',
          err
        );
      return null;
    });

  if (!chatConversationMessages) return null;

  return chatConversationMessages;
};

// TODO: only allow to update/edit latest message => triggers regeneration of AI message
export const updateChatConversationMessage = async (
  id: GetChatConversationMessage['id'],
  fields: Partial<
    Omit<
      GetChatConversationMessage,
      | 'id'
      | 'actor'
      | 'created_at'
      | 'updated_at'
      | 'chat_user_id'
      | 'chat_conversation_id'
    >
  >
) => {
  const updatedChatConversationMessage = await db
    .update(chat_conversation_message)
    .set(fields)
    .where(eq(chat_conversation_message.id, id))
    .returning()
    .catch((err) => {
      if (LOG_BACKEND)
        console.error(
          'Failed to update chat conversation message in database',
          err
        );
      return null;
    });

  if (!updatedChatConversationMessage) return null;

  return updatedChatConversationMessage[0];
};

// TODO: delete AI response to that message (TODO: maybe store a reference to the message before and after the message)
export const deleteChatConversationMessage = async (
  id: GetChatConversationMessage['id']
) => {
  const deletedChatConversationMessage = await db
    .delete(chat_conversation_message)
    .where(eq(chat_conversation_message.id, id))
    .returning()
    .catch((err) => {
      if (LOG_BACKEND)
        console.error(
          'Failed to delete chat conversation message from database',
          err
        );
      return null;
    });

  if (!deletedChatConversationMessage) return null;

  return deletedChatConversationMessage[0];
};
