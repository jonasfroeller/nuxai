<script lang="ts" setup>
import { RefreshCcw, Pen, Trash2 } from 'lucide-vue-next';
import { Search } from 'lucide-vue-next';
import Input from './ui/input/Input.vue';
import Button from './ui/button/Button.vue';
import type { AllowedAiModels } from '~/lib/types/ai.models';
import type { MinimalChat, FullyFeaturedChat } from '~/lib/types/chat';
import { ScrollArea } from '@/components/ui/scroll-area';

// improves ux
const { persistChatConversationEdit, persistChatConversationDelete } = useAPI();

// data
const { user } = useUserSession();
const selectedChat = useSelectedAiChat();
const chatToEdit = ref<MinimalChat>({
  id: -1,
  name: `chat-${Date.now()}`,
  model: 'OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5',
});

function setSelectedChat(
  id: number,
  name: string,
  model: AllowedAiModels,
  force: boolean = false,
) {
  if (selectedChat.value.id === id && force === false) {
    selectedChat.value.id = -1;
    selectedChat.value.name = `chat-${Date.now()}`; selectedChat
  } else {
    selectedChat.value.id = id;
    selectedChat.value.name = name;
    selectedChat.value.model = model;
  }

  console.info('setSelectedChat', selectedChat.value);
}

const editChat = (id: number, name: string) => {
  chatToEdit.value.id = id;
  chatToEdit.value.name = name;
};

const saveEdit = async (id: number) => {
  const data = await persistChatConversationEdit(user?.value?.id ?? -1, id, chatToEdit.value?.name);

  console.log("DATA", data);

  if (data && data.chat?.name) {
    const { name: chatName } = data.chat;

    setSelectedChat(
        chatToEdit.value.id,
        chatName,
        chatToEdit.value.model,
        true,
    );
    
    chatToEdit.value.id = -1;
    chatToEdit.value.name = `chat-${Date.now()}`;
  }

  fetchedChatsRefresh();
};

const deleteChat = async (id: number) => {
  await persistChatConversationDelete(user?.value?.id ?? -1, id);

  if (selectedChat.value.id === id) {
    setSelectedChat(
        -1,
        `chat-${Date.now()}`,
        'OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5',
    );
  }

  fetchedChatsRefresh();
};

const { 
  data: fetchedChats, 
  status: fetchedChatsStatus, 
  error: fetchedChatsError, 
  refresh: fetchedChatsRefresh 
} = await useFetch(
  `/api/users/${user.value?.id}/chats`,
  {
    method: 'GET',
    lazy: true,
    pick: ['chats'],
  },
);

const searchQuery = ref('');
let filteredChats = computed(() => {
  if (!fetchedChats.value?.chats) return [];

  const chats: FullyFeaturedChat[] = fetchedChats.value.chats as FullyFeaturedChat[];
  return chats.filter((chat: FullyFeaturedChat) =>
    chat.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
  );
});
</script>

<template>
  <div class="relative h-full p-2 border rounded-md">
    <div
      class="sticky top-0 left-0 z-10 flex items-center w-full gap-1 pb-2 bg-background"
    >
      <div class="relative w-full">
        <Input
          v-model="searchQuery"
          id="search"
          type="text"
          placeholder="Search..."
          class="pl-10"
        />
        <span
          class="absolute inset-y-0 flex items-center justify-center px-2 start-0"
        >
          <Search class="size-6 text-muted-foreground" />
        </span>
      </div>
      <Button
        :disabled="fetchedChatsStatus === 'pending'"
        variant="outline"
        @click="fetchedChatsRefresh"
        class="[&>*]:hover:animate-spin"
      >
        <RefreshCcw class="w-4 h-4" />
      </Button>
    </div>

    <div class="h-[calc(100%-3rem)]">
      <ScrollArea
        class="h-full"
        v-if="
          filteredChats &&
          Array.isArray(filteredChats) &&
          filteredChats?.length !== 0
        "
      >
        <div class="flex flex-col h-full gap-1">
          <div
            class="flex justify-between w-full gap-8 p-4 border rounded-sm border-border bg-background"
            :id="String(chat?.id)"
            v-for="chat in filteredChats"
            :key="chat?.id"
            v-bind:class="{
              'border border-green-600': selectedChat?.id === chat?.id,
            }"
          >
            <div class="flex flex-col gap-1">
              <div class="flex items-center gap-1">
                <template v-if="chatToEdit.id === chat.id">
                  <Input
                    @keydown.enter="saveEdit(chat.id)"
                    v-model="chatToEdit.name"
                  />
                  <Button variant="outline" @click="saveEdit(chat.id)"
                    >Save</Button
                  >
                </template>
                <template v-else>
                  <Button
                    :variant="
                      selectedChat?.id === chat?.id ? 'secondary' : 'outline'
                    "
                    @click="setSelectedChat(chat.id, chat.name, chat.model)"
                    >{{ chat?.name }}</Button
                  >
                  <Button
                    variant="outline"
                    @click="editChat(chat.id, chat.name)"
                    ><Pen class="w-4 h-4"
                  /></Button>
                </template>
              </div>
              <Button variant="destructive" @click="deleteChat(chat?.id)"
                >delete<Trash2 class="w-4 h-4 ml-1"
              /></Button>
            </div>
            <div class="grid text-right">
              <span class="truncate text-muted-foreground">{{
                chat?.model
              }}</span>
              <NuxtTime
                class="text-muted-foreground"
                :datetime="chat?.created_at ?? new Date()"
                day="numeric"
                month="numeric"
                year="numeric"
                hour="numeric"
                minute="numeric"
              />
              <NuxtTime
                class="text-muted-foreground"
                :datetime="chat?.updated_at ?? new Date()"
                day="numeric"
                month="numeric"
                year="numeric"
                hour="numeric"
                minute="numeric"
              />
            </div>
          </div>
        </div>
      </ScrollArea>
      <div class="pt-2 text-center" v-else>
        <p v-if="Array.isArray(fetchedChats?.chats) && fetchedChats?.chats?.length === 0">
          No Chats yet... ({{ fetchedChatsStatus }})
        </p>
        <p v-else>No search results... ({{ fetchedChatsStatus }})</p>
        <p v-if="fetchedChatsError">{{ fetchedChatsError.message }} ({{ fetchedChatsError.data.data }})</p>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
