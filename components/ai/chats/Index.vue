<script lang="ts" setup>
import {
  RefreshCcw,
  Pen,
  Trash2,
  Search,
  Loader2,
  Filter,
  FilterX,
} from 'lucide-vue-next';
import type { AllowedAiModels } from '~/lib/types/ai.models';
import type { MinimalChat, FullyFeaturedChat } from '~/lib/types/chat';

defineProps<{
  useSmall?: boolean;
}>();

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
}

const editChat = (id: number, name: string) => {
  chatToEdit.value.id = id;
  chatToEdit.value.name = name;
};

const saveEdit = async (id: number, previousName: string) => {
  if (previousName !== chatToEdit.value.name) {
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

    await fetchedChatsRefresh.value();
  } else {
    chatToEdit.value.id = -1;
  }
};

const chatsSelectedForDeletion = useChatsSelectedForDeletion();
const deleteChat = async (id: number) => {
  await persistChatConversationDelete(user?.value?.id ?? -1, id);

  if (selectedAiChat.value.id === id) {
    setSelectedChat(
      -1,
      `chat-${Date.now()}`,
      'OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5'
    );
  }

  await fetchedChatsRefresh.value();
};

const batchDeleteSelectorIsActive = ref(false);
const batchDeleteChats = async () => {
  await persistChatConversationDelete(
    user?.value?.id ?? -1,
    chatsSelectedForDeletion.value
  );

  batchDeleteSelectorIsActive.value = false;
  chatsSelectedForDeletion.value = [];

  setSelectedChat(
    -1,
    `chat-${Date.now()}`,
    'OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5'
  );

  await fetchedChatsRefresh.value();
};
const isSelectedForBatchDeletion = (id: number) => {
  return chatsSelectedForDeletion.value.includes(id);
};
const toggleSelectedForBatchDeletion = (id: number) => {
  if (isSelectedForBatchDeletion(id)) {
    chatsSelectedForDeletion.value = chatsSelectedForDeletion.value.filter(
      (chatId) => chatId !== id
    );
  } else {
    chatsSelectedForDeletion.value.push(id);
  }
};
const toggleAllForBatchDeletion = () => {
  chatsSelectedForDeletion.value = filteredChats.value.map(
    (chat: FullyFeaturedChat) => chat.id
  );
};
const unToggleAllForBatchDeletion = () => {
  chatsSelectedForDeletion.value = [];
};

const filterVisible = ref(false);
const {
  fetchedChats,
  fetchedChatsStatus,
  fetchedChatsError,
  fetchedChatsRefresh,
  fetchChats,
  fetchChatsUrl,
} = useFetchChats(user.value?.id ?? -1);

(async () => {
  await fetchChats(fetchChatsUrl.value);
})();

watchDebounced(
  fetchChatsUrl,
  async () => {
    await fetchChats(fetchChatsUrl.value);
  },
  { debounce: 300, maxWait: 500 }
);

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
  <div class="relative h-[calc(100%-2.25rem)] p-2 border rounded-md">
    <div class="pb-2 bg-background">
      <div class="flex flex-wrap items-center w-full gap-1">
        <div class="relative w-full">
          <ShadcnInput
            v-model="searchQuery"
            id="search"
            type="text"
            placeholder="Search..."
            class="pl-10"
            :disabled="fetchedChatsStatus === 'pending'"
          />
          <span
            class="absolute inset-y-0 flex items-center justify-center px-2 start-0"
          >
            <Search class="size-6 text-muted-foreground" />
          </span>
        </div>
        <template
          v-if="
            batchDeleteSelectorIsActive && chatsSelectedForDeletion.length > 0
          "
        >
          <ShadcnAlertDialog>
            <div class="flex gap-1">
              <ShadcnAlertDialogTrigger as-child>
                <ShadcnButton variant="destructive" class="w-full"
                  >Delete<Trash2 class="w-4 h-4 ml-1"
                /></ShadcnButton>
              </ShadcnAlertDialogTrigger>
            </div>
            <ShadcnAlertDialogContent>
              <ShadcnAlertDialogHeader>
                <ShadcnAlertDialogTitle
                  >Are you sure, that you want to delete
                  {{ chatsSelectedForDeletion.length }}
                  chats?</ShadcnAlertDialogTitle
                >
                <ShadcnAlertDialogDescription>
                  Chats can not be recovered!
                </ShadcnAlertDialogDescription>
              </ShadcnAlertDialogHeader>
              <ShadcnAlertDialogFooter>
                <ShadcnAlertDialogCancel>Cancel</ShadcnAlertDialogCancel>
                <ShadcnAlertDialogAction as-child>
                  <ShadcnButton
                    :disabled="
                      fetchedChatsStatus === 'pending' ||
                      filteredChats.length === 0
                    "
                    :variant="
                      batchDeleteSelectorIsActive ? 'destructive' : 'outline'
                    "
                    @click="batchDeleteChats"
                    >Delete<Trash2 class="w-4 h-4 ml-1"
                  /></ShadcnButton>
                </ShadcnAlertDialogAction>
              </ShadcnAlertDialogFooter>
            </ShadcnAlertDialogContent>
          </ShadcnAlertDialog>
        </template>
        <template v-else>
          <ShadcnButton
            :disabled="
              fetchedChatsStatus === 'pending' || filteredChats.length === 0
            "
            :variant="batchDeleteSelectorIsActive ? 'destructive' : 'outline'"
            @click="
              () => {
                batchDeleteSelectorIsActive = !batchDeleteSelectorIsActive;
              }
            "
            >Delete<Trash2 class="w-4 h-4 ml-1"
          /></ShadcnButton>
        </template>
        <ShadcnButton
          variant="outline"
          @click="filterVisible = !filterVisible"
          :disabled="fetchedChatsStatus === 'pending'"
          >Filter
          <template v-if="filterVisible">
            <FilterX class="w-4 h-4 ml-1" />
          </template>
          <template v-else>
            <Filter class="w-4 h-4 ml-1" />
          </template>
        </ShadcnButton>
        <ShadcnButton
          :disabled="fetchedChatsStatus === 'pending'"
          variant="outline"
          @click="async () => await fetchedChatsRefresh()"
          class="[&>*]:hover:animate-spin"
        >
          Reload
          <RefreshCcw class="w-4 h-4 ml-1" />
        </ShadcnButton>
      </div>

      <template v-if="filterVisible">
        <AiChatsOrderByFilter />
      </template>

      <fieldset
        v-if="batchDeleteSelectorIsActive"
        class="grid gap-6 p-4 mt-1 border rounded-lg"
      >
        <legend class="px-1 -ml-1 text-sm font-medium">
          Batch Delete Options
        </legend>

        <template v-if="chatsSelectedForDeletion.length > 0">
          <ShadcnButton variant="outline" @click="unToggleAllForBatchDeletion">
            Deselect all
          </ShadcnButton>
        </template>
        <template v-else>
          <ShadcnButton variant="outline" @click="toggleAllForBatchDeletion">
            Select all
          </ShadcnButton>
        </template>
      </fieldset>
    </div>

    <div class="h-[calc(100%-3rem)]">
      <div
        v-show="fetchedChatsStatus === 'pending'"
        class="flex items-center justify-center gap-2 px-3 py-2 mb-2 border border-blue-200 rounded-lg bg-background"
      >
        <Loader2 class="w-4 h-4 mr-1 text-blue-500 animate-spin" />
        <p class="flex-grow">Loading chats<LoadingDots /></p>
      </div>
      <ShadcnScrollArea
        class="h-full"
        :class="{ 'h-40': useSmall }"
        v-if="
          filteredChats &&
          Array.isArray(filteredChats) &&
          filteredChats?.length !== 0
        "
      >
        <div class="flex flex-col h-full gap-1">
          <div
            nuxt-client
            class="flex flex-wrap justify-between flex-grow w-full gap-3 p-4 border rounded-sm border-border bg-background"
            :id="String(chat?.id)"
            v-for="chat in filteredChats"
            :key="chat?.id"
            v-bind:class="{
              'border border-green-600': selectedAiChat?.id === chat?.id,
            }"
          >
            <div class="hidden border-green-600"></div>
            <div class="flex flex-col flex-grow gap-1">
              <div class="flex items-center gap-1">
                <template v-if="chatToEdit.id === chat.id">
                  <ShadcnInput
                    @keydown.enter="saveEdit(chat.id, chat.name)"
                    @keydown.escape="chatToEdit.id = -1"
                    v-model="chatToEdit.name"
                    class="flex-grow"
                  />
                  <ShadcnButton
                    variant="outline"
                    @click="saveEdit(chat.id, chat.name)"
                    >Save</ShadcnButton
                  >
                </template>
                <template v-else>
                  <ShadcnButton
                    :variant="
                      selectedAiChat?.id === chat?.id ? 'secondary' : 'outline'
                    "
                    @click="setSelectedChat(chat.id, chat.name, chat.model)"
                    class="flex-grow"
                    >{{ chat?.name }}</ShadcnButton
                  >
                  <ShadcnButton
                    variant="outline"
                    @click="editChat(chat.id, chat.name)"
                    ><Pen class="w-4 h-4"
                  /></ShadcnButton>
                </template>
              </div>
              <ShadcnAlertDialog>
                <div class="flex gap-1">
                  <ShadcnAlertDialogTrigger as-child>
                    <ShadcnButton variant="destructive" class="w-full"
                      >Delete<Trash2 class="w-4 h-4 ml-1"
                    /></ShadcnButton>
                  </ShadcnAlertDialogTrigger>
                  <ShadcnCheckbox
                    v-if="batchDeleteSelectorIsActive"
                    class="w-10 h-full"
                    :checked="chatsSelectedForDeletion.includes(chat.id)"
                    @click.prevent="toggleSelectedForBatchDeletion(chat.id)"
                  />
                </div>
                <ShadcnAlertDialogContent>
                  <ShadcnAlertDialogHeader>
                    <ShadcnAlertDialogTitle
                      >Are you sure, that you want to delete the
                      chat?</ShadcnAlertDialogTitle
                    >
                    <ShadcnAlertDialogDescription>
                      Chats can not be recovered!
                    </ShadcnAlertDialogDescription>
                  </ShadcnAlertDialogHeader>
                  <ShadcnAlertDialogFooter>
                    <ShadcnAlertDialogCancel>Cancel</ShadcnAlertDialogCancel>
                    <ShadcnAlertDialogAction as-child>
                      <ShadcnButton
                        variant="destructive"
                        @click="deleteChat(chat?.id)"
                        >Delete<Trash2 class="w-4 h-4 ml-1"
                      /></ShadcnButton>
                    </ShadcnAlertDialogAction>
                  </ShadcnAlertDialogFooter>
                </ShadcnAlertDialogContent>
              </ShadcnAlertDialog>
            </div>

            <div>
              <span class="truncate text-muted-foreground">{{
                chat?.model
              }}</span
              ><br />
              <NuxtTime
                class="text-muted-foreground"
                :datetime="chat?.created_at ?? new Date()"
                day="numeric"
                month="numeric"
                year="numeric"
                hour="numeric"
                minute="numeric"
              /><br />
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
          {{ fetchedChatsError.message }} ({{ fetchedChatsError.data?.data }})
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
