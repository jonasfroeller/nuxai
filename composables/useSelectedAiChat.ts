import type { Chat } from '~/lib/types/chat';

export const useSelectedAiChat = () => {
  return useState('selected-ai-chat', () =>
    ref<Chat>({
      id: -1,
      name: `chat-${Date.now()}`,
      model: 'OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5',
    }),
  );
};
