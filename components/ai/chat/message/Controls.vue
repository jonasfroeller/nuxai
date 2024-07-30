<script lang="ts" setup>
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import strip from 'strip-markdown';
import { Volume2, CirclePause } from 'lucide-vue-next';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const props = defineProps<{
  message: string;
}>();

const messageAsPlainText = ref(props.message);
const processMarkdown = async (markdown: string) => {
  const file = await unified()
    .use(remarkParse)
    .use(strip)
    .use(remarkStringify)
    .process(markdown);

  messageAsPlainText.value = String(file);
};

onMounted(async () => {
  await processMarkdown(props.message);
});

/* SPEECH SYNTHESIS */
// TODO: find out, why the speaker sometimes suddenly stops
const {
  isSupported: isSpeechSynthesisSupported,
  isPlaying: isSpeaking,
  // status: speechSynthesisStatus,
  // utterance: currentUtterance,
  // error: speechSynthesisError,
  stop: stopSpeaking,
  speak: speakText,
} = useSpeechSynthesis(messageAsPlainText, {
  lang: 'en-US',
  pitch: 1,
  rate: 1,
  volume: 1,
});
</script>

<template>
  <div class="flex flex-wrap items-center gap-1 mb-1">
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger as-child>
          <ShadcnButton
            variant="ghost"
            size="icon"
            :disabled="!isSpeechSynthesisSupported"
            @click="
              () => {
                if (!isSpeaking) speakText();
                if (isSpeaking) stopSpeaking();
              }
            "
          >
            <template v-if="isSpeaking">
              <CirclePause class="w-6 h-6" />
            </template>
            <template v-else>
              <Volume2 class="w-6 h-6" />
            </template>
          </ShadcnButton>
        </TooltipTrigger>
        <TooltipContent side="top"> Read Message </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger as-child>
          <CopyToClipboard :text="messageAsPlainText" />
        </TooltipTrigger>
        <TooltipContent side="top"> Copy to Clipboard </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>
</template>

<style scoped></style>
