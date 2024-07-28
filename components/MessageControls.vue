<script lang="ts" setup>
import { Volume2, CirclePause, Copy, CopyCheck } from 'lucide-vue-next';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const props = defineProps<{
  message: string;
}>();

/* SPEECH SYNTHESIS */
const {
  isSupported: isSpeechSynthesisSupported,
  isPlaying: isSpeaking,
  // status: speechSynthesisStatus,
  // utterance: currentUtterance,
  error: speechSynthesisError,
  stop: stopSpeaking,
  speak: speakText,
} = useSpeechSynthesis(props.message, {
  lang: 'en-US',
  pitch: 1,
  rate: 1,
  volume: 1,
});

watch(speechSynthesisError, () => {
  isSpeaking.value = false;
});

/* COPY TO CLIPBOARD */
// const mime = 'text/markdown'; // Unknown error (NotAllowedError: Failed to execute 'write' on 'Clipboard': Type text/markdown not supported on write.)
const mime = 'text/plain';
const source = ref([
  new ClipboardItem({
    [mime]: new Blob([props.message], { type: mime }),
  }),
]);

const {
  // content: copiedText,
  copy: copyToClipboard,
  copied: isCopied,
  isSupported: isClipboardSupported,
} = useClipboardItems({ source });
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
          <ShadcnButton
            variant="ghost"
            size="icon"
            :disabled="!isClipboardSupported"
            @click="copyToClipboard(source)"
          >
            <template v-if="isCopied">
              <CopyCheck class="w-5 h-5" />
            </template>
            <template v-else>
              <Copy class="w-5 h-5" />
            </template>
          </ShadcnButton>
        </TooltipTrigger>
        <TooltipContent side="top"> Copy to Clipboard </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>
</template>

<style scoped></style>
