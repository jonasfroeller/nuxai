<script lang="ts" setup>
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
</script>

<template>
  <div class="flex flex-wrap gap-1 mb-1">
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger as-child>
          <ShadcnButton
            variant="outline"
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
              <CirclePause />
            </template>
            <template v-else>
              <Volume2 />
            </template>
          </ShadcnButton>
        </TooltipTrigger>
        <TooltipContent side="top"> Read Message </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>
</template>

<style scoped></style>
