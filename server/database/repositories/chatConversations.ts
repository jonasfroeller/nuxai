import { chat_conversation, type GetUser, type ChatConversationToCreate, type GetChatConversation } from '../../../lib/types/database.tables/schema';
import { eq, desc } from 'drizzle-orm';

export async function createChatConversation(
  conversation: ChatConversationToCreate
) {
  const createdChatConversation = await db
    .insert(chat_conversation)
    .values(conversation)
    .returning()
    .catch((err) => {
      if (LOG_BACKEND)
        console.error('Failed to insert chat conversation into database', err);
      return null;
    });

  if (!createdChatConversation) return null;

  return createdChatConversation[0];
}

export async function readChatConversation(id: GetChatConversation['id']) {
  const fetchedChatConversation = await db
    .select()
    .from(chat_conversation)
    .where(eq(chat_conversation.id, id))
    .catch((err) => {
      if (LOG_BACKEND)
        console.error('Failed to fetch chat conversation from database', err);
      return null;
    });

  if (!fetchedChatConversation) return null;

  return fetchedChatConversation[0];
}

export async function readAllChatConversationsOfUser(user_id: GetUser['id']) { // TODO: dynamic filter with query parameters
  const fetchedChatConversations = await db
    .select()
    .from(chat_conversation)
    .where(eq(chat_conversation.chat_user_id, user_id))
    .orderBy(desc(chat_conversation.updated_at))
    .catch((err) => {
      if (LOG_BACKEND)
        console.error('Failed to fetch chat conversations from database', err);
      return null;
    });

  if (!fetchedChatConversations) return null;

  return fetchedChatConversations;
}

export async function updateChatConversation(
  id: GetChatConversation['id'],
  fields: Partial<
    Omit<
      GetChatConversation,
      'id' | 'model' | 'created_at' | 'updated_at' | 'chat_user_id'
    >
  >
) {
  const updatedChatConversation = await db
    .update(chat_conversation)
    .set(fields)
    .where(eq(chat_conversation.id, id))
    .returning()
    .catch((err) => {
      if (LOG_BACKEND)
        console.error('Failed to update chat conversation in database', err);
      return null;
    });

  if (!updatedChatConversation) return null;

  return updatedChatConversation[0];
}

export async function deleteChatConversation(id: GetChatConversation['id']) {
  const deletedChatConversation = await db
    .delete(chat_conversation)
    .where(eq(chat_conversation.id, id))
    .returning()
    .catch((err) => {
      if (LOG_BACKEND)
        console.error('Failed to delete chat conversation from database', err);
      return null;
    });

  if (!deletedChatConversation) return null;

  return deletedChatConversation[0];
}
