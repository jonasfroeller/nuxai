import type { MinimalChat } from '~/lib/types/chat';
import type { AllowedAiModelPaths } from '~/lib/types/ai.models';
import { generateUUID } from '~/lib/utils';

function createChatName(time: Date) {
  return `chat-${time.valueOf()}`;
}

export const useSelectedAiChat = () => {
  const aiChatReCreationTrigger = useState('selected-ai-chat-is-recreated', () => ref<string>(generateUUID()));
  const selectedAiChat = useState('selected-ai-chat', () => reactive<MinimalChat>(selectedAiChatDefaults(new Date())));

  const selectedAiChatApiPath = computed<AllowedAiModelPaths>(() => {
    return `/api/ai/huggingface/${selectedAiChat.value.model}/chat`;
  });
  const selectedAiChatIsPlayground = computed(
    () => selectedAiChatId.value === -1
  );
  const selectedAiChatId = computed(() => selectedAiChat?.value?.id ?? -1);
  const selectedAiChatKey = computed(() => `${selectedAiChatApiPath.value}?chat_id=${selectedAiChat.value.id}&isPlayground=${selectedAiChatIsPlayground.value}&isRecreated=${aiChatReCreationTrigger.value}`);

  function selectedAiChatDefaults(time: Date) {
    return {
      id: -1,
      name: createChatName(time),
      model: 'OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5',
    } as MinimalChat;
  }

  const resetSelectedAiChatToDefaults = () => {
    selectedAiChat.value = selectedAiChatDefaults(new Date());
    aiChatReCreationTrigger.value = generateUUID();
  };

  return {
    selectedAiChatKey,
    selectedAiChat,
    selectedAiChatId,
    selectedAiChatIsPlayground,
    selectedAiChatApiPath,
    resetSelectedAiChatToDefaults,
  };
};

export const useAiChatPlayground = () => {
  const aiPlaygroundChatName = useState('playground-ai-chat-name', () => ref<string>());
  const aiPlaygroundChatMessages = useState('playground-ai-chat-messages', () =>
    reactive<any[]>([])
  ); // Message is too complex...

  const { selectedAiChat, resetSelectedAiChatToDefaults } = useSelectedAiChat();
  if (selectedAiChat.value.id !== -1) { // set name, depending on selected chat
    aiPlaygroundChatName.value = createChatName(new Date());
  } else {
    aiPlaygroundChatName.value = selectedAiChat.value.name;
  }

  function resetAiPlaygroundChat() {
    aiPlaygroundChatMessages.value = []; // setChatMessages([]); is done by rerendering the whole component which recreates the useChat composable with a new id
    resetSelectedAiChatToDefaults();
  }

  return {
    aiPlaygroundChatName,
    aiPlaygroundChatMessages,
    resetAiPlaygroundChat,
  };
};
