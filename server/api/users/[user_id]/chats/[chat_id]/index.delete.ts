import { deleteChatConversation } from "~/server/database/repositories/chatConversations";

// Delete chat conversation
export default defineEventHandler(async (event) => {
    const user_id = getRouterParam(event, 'user_id');
    const chat_id = getRouterParam(event, 'chat_id');

    /* TODO: validation */

    const deletedChat = await deleteChatConversation(Number(chat_id));

    return {
        chat: deletedChat
    }
})
