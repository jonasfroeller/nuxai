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
import { Button } from '@/components/ui/button';
import Input from './ui/input/Input.vue';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useChat } from '@ai-sdk/vue';
import { Label } from '@/components/ui/label';
import { toast } from 'vue-sonner';

/* CHAT AI */
const selectedChat = useSelectedAiChat();
const selectedModelApiPath = useSelectedAiModelApiPath();
let {
  messages: chatMessages,
  input: currentChatMessage,
  error: chatError,
  handleSubmit: handleChatMessageSubmit,
  reload: reloadLastChatMessage,
  isLoading: chatResponseIsLoading,
  setMessages: setChatMessages,
} = useChat({
  api: selectedModelApiPath.value,
  keepLastMessageOnError: true,
});

watch(chatError, () => {
  if (chatError.value) {
    toast.error(`Chat error! (${chatError.value.message})`);
  }
});

/* SPEECH RECOGNITION */
const { 
  isSupported: isSpeechRecognitionSupported, 
  isListening: isListeningToSpeech, 
  result: speechRecognitionResult, 
  start: startSpeechRecognition, 
  stop: stopSpeechRecognition, 
  error: speechRecognitionError 
} =
  useSpeechRecognition({
    lang: 'en-US',
    interimResults: true,
    continuous: true,
  });

watch(speechRecognitionError, async () => {
  if (speechRecognitionError.value?.error === 'not-allowed') {
    toast.error(
      'Speech recognition was disabled for this page!\nPlease allow it, to use the feature!',
    );
  } else {
    toast.error(`Speech recognition error! (${speechRecognitionError.value?.error})`);
  }
});

if (isSpeechRecognitionSupported.value && IS_CLIENT) {
  watch(speechRecognitionResult, () => {
    currentChatMessage.value = speechRecognitionResult.value;
  });
}

/* LOADING INDICATOR */
let toastIdAiIsResponding: string | number;
let toastIdAiIsNotResponding: string | number;
watch(chatResponseIsLoading, (newValue) => {
  if (!newValue) {
    if (IS_CLIENT) {
      toastIdAiIsNotResponding = toast.success('AI is done responding!');
      toast.dismiss(toastIdAiIsResponding);
    }

    chatResponseIsLoading.value = false; // TODO: find out why this is needed
  } else if (newValue) {
    if (IS_CLIENT) {
      toastIdAiIsResponding = toast.loading('AI is responding...');
      toast.dismiss(toastIdAiIsNotResponding);
    }
  }
});

/* CONVERT HTML TO MARKDOWN */
let urlToFetchHtmlFrom = ref('');
</script>

<template>
  <div
    class="relative flex flex-col h-full min-h-[60vh] max-h-[75vh] rounded-xl bg-muted/50 p-4 w-[100%-2rem] order-1 2xl:order-2"
  >
    <Badge variant="outline" class="absolute z-10 right-3 top-3 bg-background">
      {{ selectedChat.name }}
    </Badge>

    <ScrollArea class="flex flex-col flex-grow max-w-full min-h-0 pt-8 pb-6">
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
          <!-- <Button class="absolute bottom-[-70%] right-[-1rem] px-2 py-1 border rounded-md w-fit bg-background border-slate-200 dark:border-border" variant="ghost" size="icon" @click="respondToMessage(`message-${m.id}`)">respond</Button> -->
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

      <!-- Input draft -->
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

      <div
        v-show="chatResponseIsLoading"
        class="flex flex-wrap items-center gap-2 px-4 py-2 border border-blue-200 rounded-lg bg-background"
      >
        <Loader2 class="w-4 h-4 mr-2 text-blue-500 animate-spin" />
        <p class="flex-grow">Waiting for response...</p>
      </div>

      <div
        v-if="chatError"
        class="flex flex-wrap items-center w-full p-4 mt-8 font-black uppercase border-2 rounded-md text-ellipsis border-destructive"
      >
        <p class="flex-grow">Something went wrong!</p>
        <Button variant="outline" @click="reloadLastChatMessage"
          >Try again</Button
        >
      </div>
    </ScrollArea>

    <form
      @submit="handleChatMessageSubmit"
      class="relative flex-shrink-0 overflow-hidden border rounded-lg bg-background focus-within:ring-1 focus-within:ring-ring"
    >
      <Label for="message" class="sr-only"> Message </Label>
      <Textarea
        v-model="currentChatMessage"
        id="message"
        placeholder="Type your message here..."
        class="p-3 border-0 shadow-none resize-none max-h-28 focus-visible:ring-0"
      />
      <div class="flex items-center p-3 pt-0">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger as-child>
              <Button type="button" variant="ghost" size="icon" disabled>
                <Paperclip class="size-4" />
                <span class="sr-only">Attach file</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top"> Attach File </TooltipContent>
          </Tooltip>
          <Tooltip>
            <Popover>
              <PopoverTrigger as-child>
                <TooltipTrigger as-child>
                  <Button type="button" variant="ghost" size="icon">
                    <Link class="size-4" />
                    <span class="sr-only">URL context</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top"> URL context </TooltipContent>
              </PopoverTrigger>
              <PopoverContent>
                <div class="grid gap-2 mb-1">
                  <Label for="url">URL</Label>
                  <Input
                    id="url"
                    type="url"
                    name="url"
                    v-model="urlToFetchHtmlFrom"
                    placeholder="https://example.com"
                    required
                  />
                </div>
                <Button
                  :disabled="urlToFetchHtmlFrom.trim() === ''"
                  type="button"
                  variant="outline"
                  class="w-full"
                  @click="async () => {
                    const updatedCurrentChatMessage = await generateMarkdownFromUrl(urlToFetchHtmlFrom, currentChatMessage)
                    if (updatedCurrentChatMessage) currentChatMessage = updatedCurrentChatMessage
                  }"
                  >
                  Add URL for further context
                </Button>
              </PopoverContent>
            </Popover>
          </Tooltip>
          <Tooltip v-if="isSpeechRecognitionSupported">
            <TooltipTrigger as-child>
              <Button
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
                      console.log('stopping listening');
                      stopSpeechRecognition();
                    } else {
                      console.log('starting listening');
                      startSpeechRecognition();
                    }
                  }
                "
              >
                <Mic class="size-4" />
                <span class="sr-only">Use Microphone</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top"> Use Microphone </TooltipContent>
          </Tooltip>
          <Tooltip>
            <AlertDialog>
              <AlertDialogTrigger as-child>
                <TooltipTrigger as-child>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    :disabled="
                      chatResponseIsLoading || chatMessages.length === 0
                    "
                  >
                    <Trash2 class="size-4" />
                    <span class="sr-only">Clear Chat</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top"> Clear </TooltipContent>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle
                    >Are you sure, that you want to clear the
                    chat?</AlertDialogTitle
                  >
                  <AlertDialogDescription>
                    Chat messages can not be recovered!
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    @click="
                      () => {
                        chatMessages = [];
                        setChatMessages(chatMessages);
                      }
                    "
                    >Continue</AlertDialogAction
                  >
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger as-child>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                @click="reloadLastChatMessage"
                :disabled="chatResponseIsLoading || chatMessages.length === 0"
              >
                <RefreshCcw class="size-4" />
                <span class="sr-only">Refresh Last Response</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              Refresh (needed if ai is stuck)
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <div class="flex items-center gap-1 ml-auto">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger as-child>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  @click="currentChatMessage = ''"
                  :disabled="currentChatMessage.trim() === ''"
                >
                  <Delete class="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top"> Clear Input </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button
            type="submit"
            size="sm"
            class="gap-1.5"
            :disabled="
              chatResponseIsLoading || currentChatMessage.trim() === ''
            "
          >
            Send Message
            <CornerDownLeft class="size-3.5" />
          </Button>
        </div>
      </div>
    </form>
  </div>
</template>

<style scoped></style>
