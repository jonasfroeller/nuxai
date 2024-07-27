import type { MinimalChat } from '~/lib/types/chat';
import type {
  AllowedAiModelPaths,
  AllowedAiModels,
} from '~/lib/types/ai.models';
import { generateUUID } from '~/lib/utils';

function createChatName(time: Date) {
  return `chat-${time.valueOf()}`;
}

const localStorageSelectedChatId = useLocalStorage(
  localStorageTopicKey('selected-ai-chat-id'),
  -1
);

export const useSelectedAiChat = () => {
  const aiChatReCreationTrigger = useState(
    'selected-ai-chat-is-recreated',
    () => ref<string>(generateUUID())
  );
  const selectedAiChat = useState('selected-ai-chat', () =>
    reactive<MinimalChat>(selectedAiChatDefaults(new Date()))
  );

  const selectedAiChatApiPath = computed<AllowedAiModelPaths>(() => {
    return `/api/ai/huggingface/${selectedAiChat.value.model}/chat`;
  });
  const selectedAiChatIsPlayground = computed(
    () => selectedAiChatId.value === -1
  );
  const selectedAiChatId = computed(() => {
    if (
      IS_CLIENT &&
      localStorageSelectedChatId.value !== selectedAiChat.value.id
    ) {
      console.log(
        'localStorageSelectedChatId.value',
        localStorageSelectedChatId.value
      );
      localStorageSelectedChatId.value = selectedAiChat.value.id;
    }

    return selectedAiChat?.value?.id ?? -1;
  });
  const selectedAiChatKey = computed(
    () =>
      `${selectedAiChatApiPath.value}?chat_id=${selectedAiChat.value.id}&isPlayground=${selectedAiChatIsPlayground.value}&isRecreated=${aiChatReCreationTrigger.value}`
  );

  function selectedAiChatDefaults(
    time: Date,
    model: AllowedAiModels = 'OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5'
  ) {
    return {
      id: -1,
      name: createChatName(time),
      model,
    } as MinimalChat;
  }

  const resetSelectedAiChatToDefaults = (
    model: AllowedAiModels | undefined = undefined
  ) => {
    // somehow setting this to 'OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5' instead of undefined causes some weird errors sometimes
    selectedAiChat.value = selectedAiChatDefaults(
      new Date(),
      model ?? 'OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5'
    );
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
  const aiPlaygroundChatName = useState('playground-ai-chat-name', () =>
    ref<string>()
  );
  const aiPlaygroundChatMessages = useState('playground-ai-chat-messages', () =>
    reactive<any[]>([])
  ); // Message is too complex...

  const { selectedAiChat, resetSelectedAiChatToDefaults } = useSelectedAiChat();
  if (selectedAiChat.value.id !== -1) {
    // set name, depending on selected chat
    aiPlaygroundChatName.value = createChatName(new Date());
  } else {
    aiPlaygroundChatName.value = selectedAiChat.value.name;
  }

  function resetAiPlaygroundChat(
    model: AllowedAiModels = 'OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5'
  ) {
    aiPlaygroundChatMessages.value = []; // setChatMessages([]); is done by rerendering the whole component which recreates the useChat composable with a new id
    resetSelectedAiChatToDefaults(model);
  }

  return {
    aiPlaygroundChatName,
    aiPlaygroundChatMessages,
    resetAiPlaygroundChat,
  };
};

export const useChatsSelectedForDeletion = () => {
  const chatsSelectedForDeletion = useState('chats-selected-for-deletion', () =>
    ref<number[]>([])
  );

  return chatsSelectedForDeletion;
};
