<script lang="ts" setup>
import type { Message } from '@ai-sdk/vue';

const props = defineProps<{
  messages: Message[];
}>();
</script>

<template>
  <div
    v-for="m in messages"
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
      <!-- <ShadcnButton class="absolute bottom-[-70%] right-[-1rem] px-2 py-1 border rounded-md w-fit bg-background border-slate-200 dark:border-border" variant="ghost" size="icon" @click="respondToMessage(`message-${m.id}`)">respond</ShadcnButton> -->
      <ClientOnly>
        <MDC
          class="overflow-x-auto break-words whitespace-pre-wrap"
          :value="m.content"
        />
      </ClientOnly>
      <ShadcnSeparator class="my-4" label="Controls" />
      <AiChatMessageControls :message="m.content" :key="m.content" />
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
</template>

<style scoped></style>
