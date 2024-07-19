// Update chat message of chat conversation (TODO: only allow to edit last message => don't forget to trigger new ai request)
export default defineEventHandler((event) => {
    const user_id = getRouterParam(event, 'user_id');
    const chat_id = getRouterParam(event, 'chat_id');
    const message_id = getRouterParam(event, 'message_id');

    return {
        user_id,
        chat_id,
        message_id
    }
})
