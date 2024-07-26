<script lang="ts" setup>
import { RefreshCcw, Pen, Trash2, Search } from 'lucide-vue-next';
import type { AllowedAiModels } from '~/lib/types/ai.models';
import type { MinimalChat, FullyFeaturedChat } from '~/lib/types/chat';
const { console } = useLogger();

const { persistChatConversationEdit, persistChatConversationDelete } = useAPI();
const { user } = useUserSession();
const { selectedAiChat, resetSelectedAiChatToDefaults } = useSelectedAiChat();
const chatToEdit = ref<MinimalChat>({
  id: -1,
  name: `chat-${Date.now()}`,
  model: 'OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5',
});

function setSelectedChat(
  id: number,
  name: string,
  model: AllowedAiModels,
  force: boolean = false
) {
  if (selectedAiChat.value.id === id && force === false) {
    resetSelectedAiChatToDefaults(); // doesn't reset messages
  } else {
    selectedAiChat.value.id = id;
    selectedAiChat.value.name = name;
    selectedAiChat.value.model = model;
  }

  console.info('setSelectedChat', selectedAiChat.value);
}

const editChat = (id: number, name: string) => {
  chatToEdit.value.id = id;
  chatToEdit.value.name = name;
};

const saveEdit = async (id: number) => {
  const data = await persistChatConversationEdit(
    user?.value?.id ?? -1,
    id,
    chatToEdit.value?.name
  );

  if (data && data.chat?.name) {
    const { name: chatName } = data.chat;

    setSelectedChat(
      chatToEdit.value.id,
      chatName,
      chatToEdit.value.model,
      true
    );

    chatToEdit.value.id = -1;
    chatToEdit.value.name = `chat-${Date.now()}`;
  }

  fetchedChatsRefresh();
};

const deleteChat = async (id: number) => {
  await persistChatConversationDelete(user?.value?.id ?? -1, id);

  if (selectedAiChat.value.id === id) {
    setSelectedChat(
      -1,
      `chat-${Date.now()}`,
      'OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5'
    );
  }

  fetchedChatsRefresh();
};

const {
  data: fetchedChats,
  status: fetchedChatsStatus,
  error: fetchedChatsError,
  refresh: fetchedChatsRefresh,
} = await useFetch(`/api/users/${user.value?.id}/chats`, {
  method: 'GET',
  lazy: true,
  pick: ['chats'],
});

const searchQuery = ref('');
let filteredChats = computed(() => {
  if (!fetchedChats.value?.chats) return [];

  const chats: FullyFeaturedChat[] = fetchedChats.value
    .chats as FullyFeaturedChat[];
  return chats.filter((chat: FullyFeaturedChat) =>
    chat.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});
</script>

<template>
  <div class="relative h-full p-2 border rounded-md">
    <div
      class="sticky top-0 left-0 z-10 flex items-center w-full gap-1 pb-2 bg-background"
    >
      <div class="relative w-full">
        <ShadcnInput
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
      <ShadcnButton
        :disabled="fetchedChatsStatus === 'pending'"
        variant="outline"
        @click="fetchedChatsRefresh"
        class="[&>*]:hover:animate-spin"
      >
        <RefreshCcw class="w-4 h-4" />
      </ShadcnButton>
    </div>

    <div class="h-[calc(100%-3rem)]">
      <ShadcnScrollArea
        class="h-full"
        v-if="
          filteredChats &&
          Array.isArray(filteredChats) &&
          filteredChats?.length !== 0
        "
      >
        <ClientOnly>
          <div class="flex flex-col h-full gap-1">
            <div
              class="flex justify-between flex-grow w-full gap-8 p-4 border rounded-sm border-border bg-background"
              :id="String(chat?.id)"
              v-for="chat in filteredChats"
              :key="chat?.id"
              v-bind:class="{
                'border border-green-600': selectedAiChat?.id === chat?.id,
              }"
            >
            <div class="hidden border-green-600"></div>
              <div class="flex flex-col gap-1">
                <div class="flex items-center gap-1">
                  <template v-if="chatToEdit.id === chat.id">
                    <ShadcnInput
                      @keydown.enter="saveEdit(chat.id)"
                      v-model="chatToEdit.name"
                    />
                    <ShadcnButton variant="outline" @click="saveEdit(chat.id)"
                      >Save</ShadcnButton
                    >
                  </template>
                  <template v-else>
                    <ShadcnButton
                      :variant="
                        selectedAiChat?.id === chat?.id ? 'secondary' : 'outline'
                      "
                      @click="setSelectedChat(chat.id, chat.name, chat.model)"
                      >{{ chat?.name }}</ShadcnButton
                    >
                    <ShadcnButton
                      variant="outline"
                      @click="editChat(chat.id, chat.name)"
                      ><Pen class="w-4 h-4"
                    /></ShadcnButton>
                  </template>
                </div>
                <ShadcnButton variant="destructive" @click="deleteChat(chat?.id)"
                  >delete<Trash2 class="w-4 h-4 ml-1"
                /></ShadcnButton>
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
        </ClientOnly>
      </ShadcnScrollArea>
      <div class="h-full pt-2 text-center" v-else>
        <p
          v-if="
            Array.isArray(fetchedChats?.chats) &&
            fetchedChats?.chats?.length === 0
          "
        >
          No Chats yet... ({{ fetchedChatsStatus }})
        </p>
        <p v-else>No search results... ({{ fetchedChatsStatus }})</p>
        <p v-if="fetchedChatsError">
          {{ fetchedChatsError.message }} ({{ fetchedChatsError.data.data }})
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
