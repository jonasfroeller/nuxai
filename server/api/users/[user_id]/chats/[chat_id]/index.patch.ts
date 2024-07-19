import { updateChatConversation } from "~/server/database/repositories/chatConversations";

// Update chat conversation
export default defineEventHandler(async (event) => {
    const user_id = getRouterParam(event, 'user_id');
    const chat_id = getRouterParam(event, 'chat_id');

    /* TODO: validation */

    const { name } = await readBody(event);

    const updatedChatConversation = await updateChatConversation(Number(chat_id), { name });

    return {
        chat: updatedChatConversation
    }
})
