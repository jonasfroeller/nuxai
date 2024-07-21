import { toast } from 'vue-sonner';

// TODO: find out, why toast only works, if no chat message is sent

// wrapper around the REST-API, to improve ux
export const useAPI = () => { // Why not in in utils? -> doesn't seem to work, all the time (because it uses other composables (useFetch))
    async function generateMarkdownFromUrl(url: string, currentChatMessage: string) {
        if (url.trim() === '') return;

        try {
            new URL(url);
        } catch (error) {
            toast.error('Invalid URL!');
            return;
        }

        const endpoint = '/api/html-to-markdown/';
        const encodedUrl = encodeURIComponent(url);

        const fetchPromise = new Promise(async (resolve, reject) => {
            await useFetch(`${endpoint}${encodedUrl}`, {
                /* onRequest({ request, options }) {
                    // console.info("onRequest", request, options)
                }, */
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
            loading: "Fetching url and converting it's HTML content to markdown...",
            success: (data: any) =>
                "Successfully fetched the url and converted it's HTML content to markdown!",
            error: (data: any) =>
                "Failed to fetch the url and convert it's HTML content to markdown!",
        });

        const markdownOfUrl = await fetchPromise;
        return currentChatMessage + markdownOfUrl;
    }

    // DATA PERSISTENCE

    async function persistChatConversation(user_id: number, name: string, model: string) {
        const fetchPromise = new Promise(async (resolve, reject) => {
            await useFetch(`/api/users/${user_id}/chats`, {
                method: 'POST',
                lazy: true,
                body: {
                    model,
                    name,
                },
                pick: ['chat'],
                /* onRequest({ request, options }) {
                    // console.info("onRequest", request, options)
                }, */
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

    async function persistChatConversationEdit(user_id: number, chat_id: number, chat_name: string) {
        const fetchPromise = new Promise(async (resolve, reject) => {
            await useFetch(`/api/users/${user_id}/chats/${chat_id}`, {
                method: 'PATCH',
                body: {
                    name: chat_name,
                },
                lazy: true,
                /* onRequest({ request, options }) {
                    // console.info("onRequest", request, options)
                }, */
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

    async function persistChatConversationDelete(user_id: number, chat_id: number) {
        const fetchPromise = new Promise(async (resolve, reject) => {
            await useFetch(`/api/users/${user_id}/chats/${chat_id}`, {
                method: 'DELETE',
                lazy: true,
                /* onRequest({ request, options }) {
                    // console.info("onRequest", request, options)
                }, */
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

    return {
        generateMarkdownFromUrl,
        persistChatConversation,
        persistChatConversationEdit,
        persistChatConversationDelete,
    }
};
