import { relations } from "drizzle-orm/relations";
import { chat_user, chat_conversation_message, chat_conversation } from "./schema";

export const chat_conversation_messageRelations = relations(chat_conversation_message, ({one}) => ({
	chat_user: one(chat_user, {
		fields: [chat_conversation_message.chat_user_id],
		references: [chat_user.id]
	}),
	chat_conversation: one(chat_conversation, {
		fields: [chat_conversation_message.chat_conversation_id],
		references: [chat_conversation.id]
	}),
}));

export const chat_userRelations = relations(chat_user, ({many}) => ({
	chat_conversation_messages: many(chat_conversation_message),
}));

export const chat_conversationRelations = relations(chat_conversation, ({many}) => ({
	chat_conversation_messages: many(chat_conversation_message),
}));