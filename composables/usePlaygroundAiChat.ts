import type {
  AllowedAiModels,
  AllowedAiModelPaths,
} from '~/lib/types/ai.models';

export const useAiChatPlayground = () => {
  const name = useState('playground-ai-chat-name', () => ref<string>());
  const messages = useState('playground-ai-chat-messages', () =>
    ref<any[]>([])
  ); // Message is too complex...

  const { selectedAiChat } = useSelectedAiChat();
  if (selectedAiChat.value.id !== -1) {
    generateNewChatName();
  } else {
    name.value = selectedAiChat.value.name;
  }

  function generateNewChatName() {
    name.value = `chat-${Date.now()}`;
  }

  return {
    name,
    messages,
    generateNewChatName,
  };
};

export const useSelectedAiModel = () => {
  return useState('selected-model', () =>
    shallowRef<AllowedAiModels>(
      'OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5'
    )
  );
};

export const useSelectedAiModelApiPath = () => {
  const selectedModel = useSelectedAiModel();

  const selectedModelApiPath = computed<AllowedAiModelPaths>(() => {
    return `/api/ai/huggingface/${selectedModel.value}/chat`;
  });

  return selectedModelApiPath;
};
