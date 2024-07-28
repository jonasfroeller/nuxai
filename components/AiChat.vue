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
} from 'lucide-vue-next';
import { useChat, type Message } from '@ai-sdk/vue'; // NOTE: can only be called in setup scripts ("Could not get current instance, check to make sure that `useSwrv` is declared in the top level of the setup function.")
import { toast } from 'vue-sonner';
// import type { Message } from '@ai-sdk/vue';
const { console } = useLogger();

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
const waitForAiResponseToComplete = (condition: Ref<boolean | undefined>) => {
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
    const aiIsDoneResponding = waitForAiResponseToComplete(
      chatResponseIsLoading
    );

    // TODO: only trigger, if message is new and not also if it is received from database
    if (
      chatMessages.value[chatMessages.value.length - 1]?.role === 'assistant'
    ) {
      toast.promise(aiIsDoneResponding, {
        loading: 'Fetching AI response...',
        success: (data: any) => 'AI response fetched!',
        error: (data: any) => 'Failed to fetch AI response!',
      });
    }

    await aiIsDoneResponding;

    console.info('Setting chat history messages backup...');
    if (selectedAiChatIsPlayground.value && chatMessages.value.length > 0) {
      currentAiChatPlaygroundMessagesBackup.value = chatMessages.value;
    }
  }
);

// Uncaught (in promise) Maximum recursive updates exceeded in component <Toaster>.
// This means you have a reactive effect that is mutating its own dependencies and thus recursively triggering itself.
// Possible sources include component template, render function, updated hook or watcher source function.

/* let toastIdAiIsResponding: string | number;
let toastIdAiIsNotResponding: string | number;
watch(chatResponseIsLoading, (newValue) => {
  if (!newValue) {
    console.info('AI is done responding...');
    toastIdAiIsNotResponding = toast.success('AI is done responding!');
    toast.dismiss(toastIdAiIsResponding);
    return;
  }

  console.info('AI is responding...');
  toastIdAiIsResponding = toast.info('AI is responding...');
  toast.dismiss(toastIdAiIsNotResponding);
}); */

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
          } as Message)
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
    }
  );
});

// Send Message on CTRL + ENTER
function handleInputFieldKeyboardEvents(event: KeyboardEvent) {
  if (currentChatMessage.value.trim() === '') return;
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    handleChatMessageSubmit();
  }
}
</script>

<template>
  <div
    class="relative flex flex-col h-full min-h-[60vh] max-h-[75vh] rounded-xl bg-muted/50 p-4 w-[calc(100%-2rem)] order-1 2xl:order-2"
  >
    <ShadcnBadge
      variant="outline"
      class="absolute z-10 right-3 top-3 bg-background"
    >
      {{ selectedAiChat.name }}
    </ShadcnBadge>

    <div class="flex flex-col flex-grow max-w-full min-h-0 pt-8 pb-6">
      <ShadcnScrollArea>
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

        <div
          v-for="m in chatMessages"
          :key="m.id"
          class="flex my-2"
          v-bind:class="{
            'justify-start': m.role === 'assistant',
            'justify-end': m.role === 'user',
          }"
        >
          <div
            v-if="m.role === 'assistant'"
            class="px-4 py-2 border rounded-lg bg-background border-slate-200 max-w-[80%] relative dark:border-border"
            :id="`message-${m.id}`"
            :data-message-created-at="m.createdAt"
          >
            <!-- TODO: listen to message -->
            <!-- <ShadcnButton class="absolute bottom-[-70%] right-[-1rem] px-2 py-1 border rounded-md w-fit bg-background border-slate-200 dark:border-border" variant="ghost" size="icon" @click="respondToMessage(`message-${m.id}`)">respond</ShadcnButton> -->
            <ClientOnly>
              <MDC
                class="overflow-x-auto break-words whitespace-pre-wrap"
                :value="m.content"
              />
            </ClientOnly>
          </div>

          <div
            v-if="m.role === 'user'"
            class="px-4 py-2 border rounded-lg bg-background border-slate-200 max-w-[80%] dark:border-border"
            :id="`message-${m.id}`"
            :data-message-created-at="m.createdAt"
          >
            <ClientOnly>
              <MDC
                class="overflow-x-auto break-words whitespace-pre-wrap"
                :value="m.content"
              />
            </ClientOnly>
          </div>
        </div>

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
          <ShadcnButton
            variant="outline"
            @click="
              async () => {
                await reloadLastChatMessage()
                  .then(() => {
                    toast.success('Chat message reloaded!');
                  })
                  .catch(() => {
                    toast.error('Failed to reload chat message!');
                  });
              }
            "
            >Try again</ShadcnButton
          >
        </div>
      </ShadcnScrollArea>
    </div>

    <form
      @submit.prevent="
        () => {
          if (currentChatMessage.trim() === '') return;
          handleChatMessageSubmit();
        }
      "
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
      <div class="flex items-center p-3 pt-0">
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
                  @click="
                    async () => {
                      const updatedCurrentChatMessage =
                        await generateMarkdownFromUrl(
                          urlToFetchHtmlFrom,
                          currentChatMessage
                        );
                      if (updatedCurrentChatMessage)
                        currentChatMessage = updatedCurrentChatMessage;
                    }
                  "
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
                @click="reloadLastChatMessage"
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
        <div class="flex items-center gap-1 ml-auto">
          <ShadcnTooltipProvider>
            <ShadcnTooltip>
              <ShadcnTooltipTrigger as-child>
                <ShadcnButton
                  type="button"
                  variant="outline"
                  size="icon"
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
            class="gap-1.5"
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
