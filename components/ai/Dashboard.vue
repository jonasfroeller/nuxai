<script lang="ts" setup>
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';

// TODO: fix resizable only working if page is completely rerendered
const { width } = useWindowSize();
</script>

<template>
  <div>
    <ResizablePanelGroup
      v-if="width >= 1024"
      id="handle-group-1"
      direction="horizontal"
      class="max-w-full mt-2"
    >
      <ResizablePanel id="handle-panel-1" :min-size="25" :default-size="25">
        <AiChatTabs />
      </ResizablePanel>
      <ResizableHandle id="handle-handle-1" with-handle />
      <ResizablePanel
        id="handle-panel-2"
        :min-size="50"
        :default-size="75"
        class="px-2"
      >
        <AiChat />
        <!-- MESSAGES OF CHAT (needs key, to rerender chat, so that useChat gets a new ID, useChat can not be put anywhere als then the setup script, because some functionality depends on that environment) -->
      </ResizablePanel>
    </ResizablePanelGroup>
    <div v-else class="pt-2 pr-2">
      <AiChat />
    </div>
  </div>
</template>

<style scoped></style>
