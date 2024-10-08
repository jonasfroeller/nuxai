<script setup lang="ts">
import {
  Mic,
  Paperclip,
  Link,
  CornerDownLeft,
  RefreshCcw,
  Trash2,
  Delete,
  Loader2,
  Mouse,
  Settings2,
} from 'lucide-vue-next';
import { useChat, type Message } from '@ai-sdk/vue'; // NOTE: can only be called in setup scripts ("Could not get current instance, check to make sure that `useSwrv` is declared in the top level of the setup function.")
import { toast } from 'vue-sonner';
const { console } = useLogger();

const { loadFiles } = useFetchFiles();
const { user } = useUserSession();
const {
  aiPlaygroundChatMessages: currentAiChatPlaygroundMessagesBackup,
  resetAiPlaygroundChat,
} = useAiChatPlayground();
const { generateMarkdownFromUrl } = useAPI();

/* CHAT AI */
const { selectedAiChat, selectedAiChatIsPlayground, selectedAiChatKey } =
  useSelectedAiChat();
let {
  messages: chatMessages,
  input: currentChatMessage,
  error: chatError,
  handleSubmit: handleChatMessageSubmit,
  reload: reloadLastChatMessage,
  isLoading: chatResponseIsLoading,
  setMessages: setChatMessages,
  /* append: appendChatMessage, */
} = useChat({
  id: String(selectedAiChat.value.id),
  api: selectedAiChatKey.value,
  keepLastMessageOnError: true,
});

watch(chatError, () => {
  if (chatError.value) {
    toast.error(`Chat error!`);
  }
});

// INFO: Listening to chatMessages would be way more inefficient, since that would cause the callback function to be called on every token, the AI answers.
const waitForValidRef = (condition: Ref<boolean | undefined>) => {
  let unwatch: (() => void) | null = null;

  const promise = new Promise<void>((resolve, reject) => {
    try {
      unwatch = watch(
        condition,
        (newValue) => {
          if (!newValue) {
            console.info(`Resolved value ${newValue}...`);
            resolve();
          }
        },
        { immediate: true }
      );
    } catch (error) {
      console.info('Failed to resolve value!');
      reject(error);
    }
  });

  promise.finally(() => {
    if (unwatch) {
      console.info('Removing watcher...');
      unwatch();
    }
  });

  return promise;
};

watch(
  () => chatMessages.value.length,
  async (newLength, oldLength) => {
    const aiIsDoneResponding = waitForValidRef(chatResponseIsLoading);

    if (
      chatMessages.value[chatMessages.value.length - 1]?.role === 'assistant' &&
      !isLoading.value // !isLoading.value needed, so that it only shows the toast, if the messages are actually new, and not onMounted (onLoaded)
    ) {
      toast.promise(aiIsDoneResponding, {
        loading: 'Fetching AI response...',
        success: (data: any) => 'AI response fetched!',
        error: (data: any) => 'Failed to fetch AI response!',
      });
    }

    await aiIsDoneResponding;
    if (selectedAiChat.value.id !== -1) {
      await loadFiles(user.value?.id ?? -1, selectedAiChat.value.id);
    }

    console.info('Setting chat history messages backup...');
    if (selectedAiChatIsPlayground.value && chatMessages.value.length > 0) {
      currentAiChatPlaygroundMessagesBackup.value = chatMessages.value;
    }

    scrollToBottom();
  }
);

/* SPEECH RECOGNITION */
const {
  isSupported: isSpeechRecognitionSupported,
  isListening: isListeningToSpeech,
  result: speechRecognitionResult,
  start: startSpeechRecognition,
  stop: stopSpeechRecognition,
  error: speechRecognitionError,
} = useSpeechRecognition({
  lang: 'en-US',
  interimResults: true,
  continuous: true,
});

watch(speechRecognitionError, async () => {
  if (speechRecognitionError.value?.error === 'not-allowed') {
    toast.error(
      'Speech recognition was disabled for this page!\nPlease allow it, to use the feature!'
    );
  } else {
    toast.error(
      `Speech recognition error! (${speechRecognitionError.value?.error})`
    );
  }
});

if (isSpeechRecognitionSupported.value && IS_CLIENT) {
  watch(speechRecognitionResult, () => {
    currentChatMessage.value = speechRecognitionResult.value;
  });
}

/* CONVERT HTML TO MARKDOWN */
let urlToFetchHtmlFrom = ref('');

/* FILE UPLOAD */
const {
  /* files: uploadedFiles,  */ open: openFile,
  reset: resetFile,
  onChange,
} = useFileDialog({
  accept: 'text/plain',
  /* directory: true, */ // TODO: allow importing of file structure
});

onChange(async (uploadedFiles) => {
  if (uploadedFiles) {
    for (const file of uploadedFiles) {
      if (file.type !== 'text/plain') {
        toast.error('File type not supported!');
        resetFile();
        return;
      }
      appendFileUploadToInput(file.type, file.name, await file.text());
    }

    resetFile();
  }
});

function appendFileUploadToInput(type: string, name: string, text: string) {
  console.info('Appending file upload to input...');

  let prettierFileContent = `\`\`\`${type}:${name}\n${text}\n\`\`\``;
  currentChatMessage.value = prettierFileContent + currentChatMessage.value;
}

// Load data
async function loadChatMessages(user_id: number, chat_id: number) {
  if (user_id !== -1) {
    if (chat_id === -1) {
      // load playground, if no chat is selected
      chatMessages.value = currentAiChatPlaygroundMessagesBackup.value;
      return;
    }

    const data = await $fetch(
      `/api/users/${user_id}/chats/${chat_id}/messages`
    );

    if (data?.chatMessages && data.chatMessages.length > 0) {
      const chatMessages = data.chatMessages;
      const messages = chatMessages.map(
        ({ id, message, actor }) =>
          ({
            id: `${String(id)}-${String(Date.now())}`,
            content: message,
            role: actor,
          }) as Message
      );

      setChatMessages(messages);
    }
  }
}

const isLoading = ref(true);
onMounted(async () => {
  await loadChatMessages(user.value?.id ?? -1, selectedAiChat.value.id).then(
    () => {
      isLoading.value = false;
      currentChatMessageHistoryClear();
    }
  );
});

// scroll to bottom
const $scrollArea = ref();
const $actualScrollArea = ref<HTMLElement | null>(null);
onMounted(() => {
  $actualScrollArea.value = $scrollArea.value.$el.querySelector(
    '[data-radix-scroll-area-viewport]'
  ) as HTMLElement;
});

const scrollToBottom = () => {
  if ($actualScrollArea.value) {
    $actualScrollArea.value.scrollTo({
      top: $actualScrollArea.value.scrollHeight,
      behavior: 'smooth',
    });
  }
};

// TODO: find a actual solution for this
watchOnce(isLoading, () => {
  setTimeout(() => {
    if ($actualScrollArea.value) {
      scrollToBottom();
    }
  }, 500);
});

async function generateMarkdown() {
  const updatedCurrentChatMessage = await generateMarkdownFromUrl(
    urlToFetchHtmlFrom.value,
    currentChatMessage.value
  );

  if (updatedCurrentChatMessage) {
    currentChatMessage.value = updatedCurrentChatMessage;
  }
}

// Send Message on CTRL + ENTER && allow message history
function handleInputFieldKeyboardEvents(event: KeyboardEvent) {
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    submitMessage();
  }

  if ((event.ctrlKey || event.metaKey) && event.key === 'ArrowUp') {
    currentChatMessageRedo();
  }

  if ((event.ctrlKey || event.metaKey) && event.key === 'ArrowDown') {
    currentChatMessageUndo();
  }
}

function submitMessage() {
  if (currentChatMessage.value.trim() === '') return;
  currentChatMessageCommit();
  handleChatMessageSubmit();
}

const {
  // history: currentChatMessageHistory,
  commit: currentChatMessageCommit,
  undo: currentChatMessageUndo,
  redo: currentChatMessageRedo,
  clear: currentChatMessageHistoryClear,
} = useManualRefHistory(currentChatMessage, {
  capacity: 3,
});

async function reloadLast() {
  await deleteLast()
    .then(async () => {
      await reloadLastChatMessage()
        .then(() => {
          toast.success('Chat message reloaded!');
        })
        .catch(() => {
          toast.error('Failed to reload chat message!');
        });
    })
    .catch(() => {
      toast.error('Failed to reload chat message!');
    });
}

async function deleteLast() {
  await $fetch(`/api/users/2/chats/214/messages/last`, {
    method: 'DELETE',
  })
    .then(async () => {
      toast.success('Chat message deleted!');
    })
    .catch(() => {
      toast.error('Failed to delete chat message!');
    });
}

// const isDesktop = useMediaQuery('(min-width: 768px)');
</script>

<template>
  <div
    class="relative flex flex-col h-full min-h-[60vh] max-h-[75vh] rounded-xl bg-muted/50 p-4 order-1 2xl:order-2"
  >
    <div class="absolute z-10 left-3 top-3">
      <ShadcnDrawer>
        <ShadcnDrawerTrigger as-child>
          <ShadcnButton variant="ghost" size="icon" class="lg:hidden">
            <Settings2 class="size-6" />
            <span class="sr-only">Settings</span>
          </ShadcnButton>
        </ShadcnDrawerTrigger>
        <ShadcnDrawerContent class="max-h-[90vh] p-2">
          <ShadcnDrawerHeader>
            <ShadcnDrawerTitle>Configuration and Chats</ShadcnDrawerTitle>
            <ShadcnDrawerDescription>
              Configure the settings for the model and switch between chats.
            </ShadcnDrawerDescription>
          </ShadcnDrawerHeader>
          <AiChatModelConfiguration />
          <ShadcnSeparator class="my-2 bg-transparent" />
          <AiChats :useSmall="true" />
        </ShadcnDrawerContent>
      </ShadcnDrawer>
      <ShadcnButton
        type="button"
        size="icon"
        variant="ghost"
        :disabled="chatResponseIsLoading"
        @click="scrollToBottom"
      >
        <Mouse class="size-6" />
      </ShadcnButton>
    </div>

    <ShadcnBadge
      variant="outline"
      class="absolute z-10 right-3 top-3 bg-background"
    >
      {{ selectedAiChat.name }}
    </ShadcnBadge>

    <div class="flex flex-col flex-grow max-w-full min-h-0 pt-10 pb-6">
      <ShadcnScrollArea ref="$scrollArea">
        <!--
        <DevOnly>
          <ClientOnly>
            SELECTED: {{ selectedAiChat }} | {{ selectedAiChatKey }}<br />
            messages: {{ JSON.stringify(chatMessages) }}<br />
            <hr />
            PLAYGROUND: {{ selectedAiChatIsPlayground }} |
            {{ JSON.stringify(currentAiChatPlaygroundMessagesBackup) }}<br />
          </ClientOnly>
        </DevOnly>
        -->

        <AiChatMessages :messages="chatMessages" />

        <template v-if="isLoading">
          <MessagesSkeleton />
        </template>

        <!-- User Input Draft -->
        <div
          class="flex justify-end mt-8 overflow-auto"
          v-if="currentChatMessage.trim() !== ''"
        >
          <div
            class="break-words whitespace-pre-wrap max-w-[80%] border border-orange-300 rounded-lg bg-background px-4 py-2"
          >
            {{ currentChatMessage }}
          </div>
        </div>

        <!-- NOTE: v-if is server-side and v-show client-side -->
        <div
          v-show="chatResponseIsLoading"
          class="flex items-center justify-center gap-2 px-3 py-2 mb-2 border border-blue-200 rounded-lg bg-background"
        >
          <Loader2 class="w-4 h-4 mr-1 text-blue-500 animate-spin" />
          <p class="flex-grow">Waiting for response<LoadingDots /></p>
        </div>

        <div
          v-if="chatError"
          class="flex flex-wrap items-center w-full p-4 mt-8 font-black uppercase border-2 rounded-md text-ellipsis border-destructive"
        >
          <p class="flex-grow">Something went wrong!</p>
          <ShadcnButton variant="outline" @click="reloadLast"
            >Try again</ShadcnButton
          >
        </div>
      </ShadcnScrollArea>
    </div>

    <form
      @submit.prevent="submitMessage"
      class="relative flex-shrink-0 overflow-hidden border rounded-lg bg-background focus-within:ring-1 focus-within:ring-ring"
    >
      <ShadcnLabel for="message" class="sr-only"> Message </ShadcnLabel>
      <ShadcnTextarea
        v-model="currentChatMessage"
        id="message"
        placeholder="Type your message here..."
        class="p-3 border-0 shadow-none resize-none max-h-28 focus-visible:ring-0"
        @keydown="handleInputFieldKeyboardEvents"
      />
      <div class="flex flex-wrap items-center p-3 pt-0">
        <ShadcnTooltipProvider>
          <ShadcnTooltip>
            <ShadcnTooltipTrigger as-child>
              <ShadcnButton
                @click="openFile"
                type="button"
                variant="ghost"
                size="icon"
              >
                <Paperclip class="size-4" />
                <span class="sr-only">Attach file</span>
              </ShadcnButton>
            </ShadcnTooltipTrigger>
            <ShadcnTooltipContent side="top">
              Attach File
            </ShadcnTooltipContent>
          </ShadcnTooltip>
          <ShadcnTooltip>
            <ShadcnPopover>
              <ShadcnPopoverTrigger as-child>
                <ShadcnTooltipTrigger as-child>
                  <ShadcnButton type="button" variant="ghost" size="icon">
                    <Link class="size-4" />
                    <span class="sr-only">URL context</span>
                  </ShadcnButton>
                </ShadcnTooltipTrigger>
                <ShadcnTooltipContent side="top">
                  URL context
                </ShadcnTooltipContent>
              </ShadcnPopoverTrigger>
              <ShadcnPopoverContent>
                <div class="grid gap-2 mb-1">
                  <ShadcnLabel for="url">URL</ShadcnLabel>
                  <ShadcnInput
                    id="url"
                    type="url"
                    name="url"
                    v-model="urlToFetchHtmlFrom"
                    placeholder="https://example.com"
                    required
                  />
                </div>
                <ShadcnButton
                  :disabled="urlToFetchHtmlFrom.trim() === ''"
                  type="button"
                  variant="outline"
                  class="w-full"
                  @click="async () => await generateMarkdown()"
                >
                  Add URL for further context
                </ShadcnButton>
              </ShadcnPopoverContent>
            </ShadcnPopover>
          </ShadcnTooltip>
          <ShadcnTooltip v-if="isSpeechRecognitionSupported">
            <ShadcnTooltipTrigger as-child>
              <ShadcnButton
                type="button"
                variant="ghost"
                size="icon"
                v-bind:class="{
                  'animate-pulse outline-1 outline-destructive outline-dashed':
                    isListeningToSpeech,
                }"
                @click="
                  () => {
                    if (isListeningToSpeech) {
                      console.info('stopping listening');
                      stopSpeechRecognition();
                    } else {
                      console.info('starting listening');
                      startSpeechRecognition();
                    }
                  }
                "
              >
                <Mic class="size-4" />
                <span class="sr-only">Use Microphone</span>
              </ShadcnButton>
            </ShadcnTooltipTrigger>
            <ShadcnTooltipContent side="top">
              Use Microphone
            </ShadcnTooltipContent>
          </ShadcnTooltip>
          <ShadcnTooltip>
            <ShadcnAlertDialog>
              <ShadcnAlertDialogTrigger as-child>
                <ShadcnTooltipTrigger as-child>
                  <ShadcnButton
                    type="button"
                    variant="ghost"
                    size="icon"
                    :disabled="
                      chatResponseIsLoading ||
                      chatMessages.length === 0 ||
                      !selectedAiChatIsPlayground
                    "
                  >
                    <Trash2 class="size-4" />
                    <span class="sr-only">Clear Chat</span>
                  </ShadcnButton>
                </ShadcnTooltipTrigger>
                <ShadcnTooltipContent side="top"> Clear </ShadcnTooltipContent>
              </ShadcnAlertDialogTrigger>
              <ShadcnAlertDialogContent>
                <ShadcnAlertDialogHeader>
                  <ShadcnAlertDialogTitle
                    >Are you sure, that you want to clear the
                    chat?</ShadcnAlertDialogTitle
                  >
                  <ShadcnAlertDialogDescription>
                    Chat messages can not be recovered!
                  </ShadcnAlertDialogDescription>
                </ShadcnAlertDialogHeader>
                <ShadcnAlertDialogFooter>
                  <ShadcnAlertDialogCancel>Cancel</ShadcnAlertDialogCancel>
                  <ShadcnAlertDialogAction
                    @click="
                      resetAiPlaygroundChat(
                        'OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5'
                      )
                    "
                    >Continue</ShadcnAlertDialogAction
                  >
                </ShadcnAlertDialogFooter>
              </ShadcnAlertDialogContent>
            </ShadcnAlertDialog>
          </ShadcnTooltip>
          <ShadcnTooltip>
            <ShadcnTooltipTrigger as-child>
              <ShadcnButton
                type="button"
                variant="ghost"
                size="icon"
                @click="reloadLast"
                :disabled="chatResponseIsLoading || chatMessages.length === 0"
              >
                <RefreshCcw class="size-4" />
                <span class="sr-only">Refresh Last Response</span>
              </ShadcnButton>
            </ShadcnTooltipTrigger>
            <ShadcnTooltipContent side="top">
              Refresh (needed if ai is stuck)
            </ShadcnTooltipContent>
          </ShadcnTooltip>
        </ShadcnTooltipProvider>
        <div class="flex items-center w-full gap-1 sm:ml-auto sm:w-fit">
          <ShadcnTooltipProvider>
            <ShadcnTooltip>
              <ShadcnTooltipTrigger as-child>
                <ShadcnButton
                  type="button"
                  variant="outline"
                  size="icon"
                  class="px-2"
                  @click="currentChatMessage = ''"
                  :disabled="currentChatMessage.trim() === ''"
                >
                  <Delete class="w-4 h-4" />
                </ShadcnButton>
              </ShadcnTooltipTrigger>
              <ShadcnTooltipContent side="top">
                Clear Input
              </ShadcnTooltipContent>
            </ShadcnTooltip>
          </ShadcnTooltipProvider>
          <ShadcnButton
            type="submit"
            size="sm"
            class="gap-1.5 w-full"
            :disabled="
              chatResponseIsLoading || currentChatMessage.trim() === ''
            "
          >
            Send Message
            <CornerDownLeft class="size-3.5" />
          </ShadcnButton>
        </div>
      </div>
    </form>
  </div>
</template>

<style scoped></style>
