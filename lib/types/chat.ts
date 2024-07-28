import type { AllowedAiModels } from './ai.models';
import type { GetChatConversation } from './database.tables/schema';

export type MinimalChat = {
  id: GetChatConversation['id'];
  name: GetChatConversation['name'];
  model: AllowedAiModels; // drizzle doesn't support checks yet...
};

export interface FullyFeaturedChat extends MinimalChat {
  created_at: GetChatConversation['created_at'];
  updated_at: GetChatConversation['updated_at'];
  chat_user_id: GetChatConversation['chat_user_id'];
}

export type ChatConversationKeys = keyof GetChatConversation;
export type OrderByDirection = (typeof possibleOrderByDirections)[number];
export const possibleOrderByColumns: ChatConversationKeys[] = [
  'id',
  'created_at',
  'updated_at',
  'name',
  'model',
] as const;
export const possibleOrderByDirections = ['asc', 'desc'] as const;
