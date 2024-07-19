import { toast } from "vue-sonner";

export async function generateMarkdownFromUrl(url: string, currentChatMessage: string) {
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
