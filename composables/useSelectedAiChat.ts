import type { MinimalChat } from '~/lib/types/chat';

export const useSelectedAiChat = () => {
  const selectedAiChatIsPlayground = computed(
    () => selectedAiChatId.value === -1
  );
  const selectedAiChatId = computed(() => selectedAiChat?.value?.id ?? -1);
  const reCreationTrigger = useState('selected-ai-chat-is-recreated', () => ref<Date>(new Date()));
  const selectedChatKey = computed(() => `?id=${selectedAiChat.value.id}&isPlayground=${selectedAiChatIsPlayground.value}&isRecreated=${reCreationTrigger.value}`);

  const resetSelectedAiChatToDefaults = () => {
    selectedAiChat.value = {
      id: -1,
      name: `chat-${Date.now()}`,
      model: 'OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5',
    };

    reCreationTrigger.value = new Date();
  };

  const selectedAiChat = useState('selected-ai-chat', () =>
    ref<MinimalChat>({
      id: -1,
      name: `chat-${Date.now()}`,
      model: 'OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5',
    })
  );

  return {
    selectedChatKey,
    selectedAiChat,
    selectedAiChatId,
    selectedAiChatIsPlayground,
    resetSelectedAiChatToDefaults,
  };
};
