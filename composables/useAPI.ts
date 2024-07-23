import type { Message } from 'ai';
import { toast } from 'vue-sonner';
import type { FullyFeaturedChat /* , MinimalChat */ } from '~/lib/types/chat';
/* import type { UseFetchOptions } from '#app'; */

// TODO: improve => return data, isLoading etc. too.

export const useAPI = () => {
  const handleFetch = async <T>(
    url: string,
    options: any /* UseFetchOptions<unknown> */ = {},
    toastMessages: {
      loading: string;
      success: (data: any) => string;
      error: (data: any) => string;
    } | null = null
  ): Promise<T> => {
    const fetchPromise = new Promise<T>(async (resolve, reject) => {
      await useFetch(url, {
        ...options,
        onResponse({ response }: any) {
          resolve(response._data);
        },
        onResponseError({ response }: any) {
          reject(response._data);
        },
      });
    });

    if (toastMessages) {
      toast.promise(fetchPromise, toastMessages);
    }

    return fetchPromise.then((data) => data);
  };

  const generateMarkdownFromUrl = async (
    url: string,
    currentChatMessage: string
  ): Promise<string | undefined> => {
    if (url.trim() === '') return;

    try {
      new URL(url);
    } catch {
      toast.error('Invalid URL!');
      return;
    }

    const endpoint = '/api/html-to-markdown/';
    const encodedUrl = encodeURIComponent(url);

    const toastMessages = {
      loading: 'Fetching URL and converting its HTML content to Markdown...',
      success: (data: any) =>
        'Successfully fetched the URL and converted its HTML content to Markdown!',
      error: (data: any) =>
        'Failed to fetch the URL and convert its HTML content to Markdown!',
    };

    try {
      const markdownOfUrl = await handleFetch<string>(
        `${endpoint}${encodedUrl}`,
        {},
        toastMessages
      );
      return currentChatMessage + markdownOfUrl;
    } catch {
      return currentChatMessage;
    }
  };

  const persistChatConversation = async (
    user_id: number,
    name: string,
    model: string
  ) => {
    const url = `/api/users/${user_id}/chats`;
    const options = {
      method: 'POST',
      body: { model, name },
      lazy: true,
      pick: ['chat'],
    };

    const toastMessages = {
      loading: 'Persisting chat history...',
      success: (data: any) => 'Chat history persisted!',
      error: (data: any) => 'Failed to persist chat history!',
    };

    const response = await handleFetch<{ chat: FullyFeaturedChat }>(
      url,
      options,
      toastMessages
    );

    await persistChatConversationMessages(user_id, response.chat.id);

    return response.chat.id;
  };

  const persistChatConversationMessages = async (
    user_id: number,
    chat_id: number /* , messages: Message[] */
  ) => {
    const { messages: messagesRef } = useAiChatPlayground();
    const messages = messagesRef.value;

    if (!messages) {
      if (LOG_FRONTEND) console.error('No messages to persist!');
      return;
    }

    if (messages.length > 0) {
      const url = `/api/users/${user_id}/chats/${chat_id}/messages`;
      const options = {
        method: 'POST',
        body: { messages },
        lazy: true,
      };

      const toastMessages = {
        loading: 'Persisting chat messages...',
        success: (data: any) => 'Chat messages persisted!',
        error: (data: any) => 'Failed to persist chat messages!',
      };

      if (LOG_FRONTEND) console.info('Persisting messages...', messages);

      await handleFetch(url, options, toastMessages);
      messagesRef.value = [];
    }
  };

  const loadPersistedChatMessages = async (
    user_id: number,
    chat_id: number
  ) => {
    if (user_id !== -1) {
      const url = `/api/users/${user_id}/chats/${chat_id}/messages`;
      const options = {
        lazy: true,
      };

      /* const toastMessages = { // would require to fetch two times..., TODO: different solution
        loading: 'Loading chat messages...',
        success: (data: any) => 'Chat messages loaded!',
        error: (data: any) => 'Failed to load chat messages!',
      }; */

      const data = await handleFetch<{
        // TODO: improved typing. move db schema and relations in both client and server-side code
        chatMessages:
          | {
              id: number;
              created_at: Date | null;
              updated_at: Date | null;
              chat_user_id: number;
              message: string;
              actor: string;
              chat_conversation_id: number;
            }[]
          | null;
      }>(url, options);

      if (data.chatMessages && data.chatMessages.length > 0) {
        const chatMessages = data.chatMessages;

        const messages = chatMessages.map(
          ({ id, message, actor }) =>
            ({
              id: `${String(id)}-${String(Date.now())}`,
              content: message,
              role: actor,
            }) as Message
        );

        return messages;
      }

      return [];
    }

    return [];
  };

  const persistChatConversationEdit = async (
    user_id: number,
    chat_id: number,
    chat_name: string
  ) => {
    const url = `/api/users/${user_id}/chats/${chat_id}`;
    const options = {
      method: 'PATCH',
      body: { name: chat_name },
      lazy: true,
    };

    const toastMessages = {
      loading: 'Renaming chat...',
      success: (data: any) => 'Chat renamed!',
      error: (data: any) => 'Failed to rename chat!',
    };

    return await handleFetch<{ chat: FullyFeaturedChat }>(
      url,
      options,
      toastMessages
    );
  };

  const persistChatConversationDelete = async (
    user_id: number,
    chat_id: number
  ): Promise<void> => {
    const url = `/api/users/${user_id}/chats/${chat_id}`;
    const options = {
      method: 'DELETE',
      lazy: true,
    };

    const toastMessages = {
      loading: 'Deleting chat...',
      success: (data: any) => 'Chat deleted!',
      error: (data: any) => 'Failed to delete chat!',
    };

    await handleFetch<void>(url, options, toastMessages);
  };

  return {
    generateMarkdownFromUrl,
    persistChatConversation,
    loadPersistedChatMessages,
    persistChatConversationEdit,
    persistChatConversationDelete,
  };
};
