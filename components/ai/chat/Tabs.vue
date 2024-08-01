<script lang="ts" setup>
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type possibleDashboardTabs = 'chat' | 'chats';
const selectedDashboardTab = ref<possibleDashboardTabs>('chat');
const selectedDashboardTabFromLocalStorage =
  useLocalStorage<possibleDashboardTabs>(
    localStorageTopicKey('selected-dashboard-tab'),
    'chat'
  );

watch(selectedDashboardTab, () => {
  selectedDashboardTabFromLocalStorage.value = selectedDashboardTab.value;
});

onMounted(() => {
  selectedDashboardTab.value = selectedDashboardTabFromLocalStorage.value;
});
</script>

<template>
  <div>
    <Tabs
      v-model="selectedDashboardTab"
      default-value="chat"
      class="h-screen max-h-[calc(100%-3rem)] pr-2"
    >
      <TabsList class="flex justify-start w-full bg-muted/50">
        <TabsTrigger value="chats"> All Chats </TabsTrigger>
        <TabsTrigger value="chat"> Active Chat Information </TabsTrigger>
      </TabsList>
      <TabsContent value="chats" class="h-full">
        <AiChats />
      </TabsContent>
      <TabsContent value="chat" class="h-full">
        <AiChatInformation />
        <!-- FILES OF CHAT -->
      </TabsContent>
    </Tabs>
  </div>
</template>

<style scoped></style>
