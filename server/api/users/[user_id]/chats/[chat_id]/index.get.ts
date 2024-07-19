import { readChatConversation } from "~/server/database/repositories/chatConversations";

// Read chat conversation (TODO: not needed?)
export default defineEventHandler(async (event) => {
    const user_id = getRouterParam(event, 'user_id');
    const chat_id = getRouterParam(event, 'chat_id');

    /* TODO: validation */

    const fetchedChatConversation = await readChatConversation(Number(chat_id));

    return {
        chat: fetchedChatConversation
    }
})
