import { toast } from "vue-sonner";

export async function persistChatConversation(user_id: number, name: string, model: string) {
    const fetchPromise = new Promise(async (resolve, reject) => {
        await useFetch(`/api/users/${user_id}/chats`, {
            method: 'POST',
            lazy: true,
            body: {
                model,
                name,
            },
            pick: ['chat'],
            onRequest({ request, options }) {
                // console.info("onRequest", request, options)
            },
            onResponse({ request, response, options }) {
                // console.info("onResponse", request, response, options)
                resolve(response._data);
            },
            onResponseError({ request, response, options }) {
                // console.error("onResponseError", request, response, options)
                reject(response._data);
            },
        });
    });

    toast.promise(fetchPromise, {
        loading: 'Persisting chat history...',
        success: (data: any) => 'Chat history persisted!',
        error: (data: any) => 'Failed to persist chat history!',
    });

    // TODO: actually persist the messages onFinish() in chat.ts

    const response = await fetchPromise.then((data: any) => data);
    return response.chat.id;
}

export async function persistChatConversationEdit(user_id: number, chat_id: number, chat_name: string) {
    const fetchPromise = new Promise(async (resolve, reject) => {
        await useFetch(`/api/users/${user_id}/chats/${chat_id}`, {
            method: 'PATCH',
            body: {
                name: chat_name,
            },
            lazy: true,
            onRequest({ request, options }) {
                // console.info("onRequest", request, options)
            },
            onResponse({ request, response, options }) {
                // console.info("onResponse", request, response, options)
                resolve(response._data);
            },
            onResponseError({ request, response, options }) {
                // console.error("onResponseError", request, response, options)
                reject(response._data);
            },
        });
    });

    toast.promise(fetchPromise, {
        loading: 'Renaming chat...',
        success: (data: any) => 'Chat renamed!',
        error: (data: any) => 'Failed to rename chat!',
    });

    const data = await fetchPromise.then((data: any) => data);
    return data;
}

export async function persistChatConversationDelete(user_id: number, chat_id: number) {
    const fetchPromise = new Promise(async (resolve, reject) => {
        await useFetch(`/api/users/${user_id}/chats/${chat_id}`, {
            method: 'DELETE',
            lazy: true,
            onRequest({ request, options }) {
                // console.info("onRequest", request, options)
            },
            onResponse({ request, response, options }) {
                // console.info("onResponse", request, response, options)
                resolve(response._data);
            },
            onResponseError({ request, response, options }) {
                // console.error("onResponseError", request, response, options)
                reject(response._data);
            },
        });
    });

    toast.promise(fetchPromise, {
        loading: 'Deleting chat...',
        success: (data: any) => 'Chat deleted!',
        error: (data: any) => 'Failed to delete chat!',
    });

    await fetchPromise;
}
