import type {
  ChatConversationKeys,
  OrderByDirection,
} from '~/server/utils/validate';
import {
  chat_conversation,
  type GetUser,
  type ChatConversationToCreate,
  type GetChatConversation,
} from '../../../lib/types/database.tables/schema';
import { eq, inArray, desc, asc } from 'drizzle-orm';

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

function parseOrderByString(order_by: string) {
  const orders = order_by.split(',').map((order) => {
    const [column, direction] = order.split(':') as [
      ChatConversationKeys,
      OrderByDirection,
    ];
    return { column, direction };
  });
  return orders;
}

// Options for dynamic query building:
// 1. https://orm.drizzle.team/docs/sql#sqlappend
// 2. https://orm.drizzle.team/docs/dynamic-query-building
// 2.5. https://github.com/drizzle-team/drizzle-orm/issues/1644#issuecomment-1893746141
export async function readAllChatConversationsOfUser(
  user_id: GetUser['id'],
  order_by?: string
) {
  let query = db
    .select()
    .from(chat_conversation)
    .where(eq(chat_conversation.chat_user_id, user_id))
    .$dynamic();

  if (order_by) {
    const orders = parseOrderByString(order_by);
    const orderConditions = orders.map((order) => {
      return order.direction === 'asc'
        ? asc(chat_conversation[order.column])
        : desc(chat_conversation[order.column]);
    });
    query = query.orderBy(...orderConditions);
  } else {
    query = query.orderBy(
      desc(chat_conversation.updated_at),
      desc(chat_conversation.name)
    );
  }

  const fetchedChatConversations = await query.catch((err) => {
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

export async function deleteChatConversations(
  ids: GetChatConversation['id'][]
) {
  const deletedChatConversations = await db
    .delete(chat_conversation)
    .where(inArray(chat_conversation.id, ids))
    .returning()
    .catch((err) => {
      if (LOG_BACKEND)
        console.error('Failed to delete chat conversation from database', err);
      return null;
    });

  if (!deletedChatConversations) return null;

  return deletedChatConversations;
}
