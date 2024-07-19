import { chat_conversation } from "../schema";
import { eq } from "drizzle-orm";

type NewChatConversation = typeof chat_conversation.$inferInsert;
type GetChatConversation = typeof chat_conversation.$inferSelect;

type ReadChatConversation = GetChatConversation;
export interface ChatConversationToCreate extends Omit<NewChatConversation, "id" | "created_at" | "updated_at"> { };

export async function createChatConversation(conversation: ChatConversationToCreate) {
    const createdChatConversation = await db
        .insert(chat_conversation)
        .values(conversation)
        .returning()
        .catch((err) => {
            console.error("Failed to insert chat conversation into database", err);
            return null;
        });

    if (!createdChatConversation) return null;

    return createdChatConversation[0];
}

export async function readChatConversation(id: number) {
    const fetchedChatConversation = await db
        .select()
        .from(chat_conversation)
        .where(eq(chat_conversation.id, id))
        .catch((err) => {
            console.error("Failed to fetch chat conversation from database", err);
            return null;
        });

    if (!fetchedChatConversation) return null;

    return fetchedChatConversation[0];
}

export async function readAllChatConversationsOfUser(user_id: number) {
    const fetchedChatConversations = await db
        .select()
        .from(chat_conversation)
        .where(eq(chat_conversation.chat_user_id, user_id))
        .catch((err) => {
            console.error("Failed to fetch chat conversations from database", err);
            return null;
        });

    if (!fetchedChatConversations) return null;

    return fetchedChatConversations;
}

export async function updateChatConversation(id: number, fields: { name: string }) {
    const updatedChatConversation = await db
        .update(chat_conversation)
        .set(fields)
        .where(eq(chat_conversation.id, id))
        .returning()
        .catch((err) => {
            console.error("Failed to update chat conversation in database", err);
            return null;
        });

    if (!updatedChatConversation) return null;

    return updatedChatConversation[0];
}

export async function deleteChatConversation(id: number) {
    const deletedChatConversation = await db
        .delete(chat_conversation)
        .where(eq(chat_conversation.id, id))
        .returning()
        .catch((err) => {
            console.error("Failed to delete chat conversation from database", err);
            return null;
        });

    if (!deletedChatConversation) return null;

    return deletedChatConversation[0];
}
