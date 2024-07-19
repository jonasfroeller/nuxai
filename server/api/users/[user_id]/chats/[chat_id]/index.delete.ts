// Delete chat conversation
export default defineEventHandler((event) => {
    const user_id = getRouterParam(event, 'user_id');
    const chat_id = getRouterParam(event, 'chat_id');

    return {
        user_id,
        chat_id
    }
})
