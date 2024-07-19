<script lang="ts" setup>
  import { RefreshCcw, Pen, Trash2 } from 'lucide-vue-next'
  import { Search } from 'lucide-vue-next';
  import Input from './ui/input/Input.vue';
  import Button from './ui/button/Button.vue';
  import { toast } from 'vue-sonner';
  import type { AllowedAiModels } from '~/lib/types/ai.models';
  import type { Chat, ChatExtended } from '~/lib/types/chat';
  import { ScrollArea } from "@/components/ui/scroll-area"

  // TODO: make helper functions for the toasts and other functions that can be used multiple times

  const { user } = useUserSession()
  const selectedChat = useSelectedAiChat();
  const chatToEdit = ref<Chat>({
        id: -1,
        name: `chat-${Date.now()}`,
        model: "OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5"
    });
  const editChat = (id: number, name: string) => {
    chatToEdit.value.id = id;
    chatToEdit.value.name = name;
  };
  const saveEdit = async (id: number) => {
    const { data } = await useFetch(`/api/users/${user.value?.id}/chats/${id}`, {
            method: "PATCH",
            body: {
              name: chatToEdit.value?.name
            },
            lazy: true,
            onRequest({ request, options }) {
                // console.info("onRequest", request, options)
            },
            onResponse({ request, response, options }) {
                // console.info("onResponse", request, response, options)
            },
            onResponseError({ request, response, options }) {
                // console.error("onResponseError", request, response, options)
            }
        }
      )

    if (data.value !== null && data.value.chat?.name) {
      const { name: chatName } = data.value.chat;
      setSelectedChat(chatToEdit.value.id, chatName, chatToEdit.value.model, true)
      chatToEdit.value.id = -1;
      chatToEdit.value.name = `chat-${Date.now()}`;
    }

    refresh();
  };

  function setSelectedChat(id: number, name: string, model: AllowedAiModels, force: boolean = false) {
    if (selectedChat.value.id === id && force === false) {
      selectedChat.value.id = -1;
      selectedChat.value.name = `chat-${Date.now()}`;
    } else {
      selectedChat.value.id = id;
      selectedChat.value.name = name;
      selectedChat.value.model = model;
    }

    console.info("setSelectedChat", selectedChat.value);
  }

  const { data, status, error, refresh } = await useFetch(`/api/users/${2}/chats`, {
      method: "GET",
      lazy: true,
      pick: ["chats"]
  })

  const deleteChat = async (chatId: number) => {
    const fetchPromise = new Promise(async (resolve, reject) => {
        await useFetch(`/api/users/${2}/chats/${chatId}`, {
            method: "DELETE",
            lazy: true,
            onRequest({ request, options }) {
                // console.info("onRequest", request, options)
            },
            onResponse({ request, response, options }) {
                // console.info("onResponse", request, response, options)
                resolve(response._data)
            },
            onResponseError({ request, response, options }) {
                // console.error("onResponseError", request, response, options)
                reject(response._data)
            }
        })
    })

    if (selectedChat.value.id === chatId) {
      setSelectedChat(-1, `chat-${Date.now()}`, "OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5")
    }

    toast.promise(fetchPromise, {
        loading: 'Deleting chat...',
        success: (data: any) => "Chat deleted!",
        error: (data: any) => "Failed to delete chat!",
    })

    refresh();
  }

  const searchQuery = ref('');
  let filteredChats = computed(() => {
    if (!data.value?.chats) return [];

    const chats: ChatExtended[] = data.value.chats as ChatExtended[];
    return chats.filter((chat: ChatExtended) => 
      chat.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  });
</script>

<template>
  <div class="relative h-full p-2 border rounded-md">
    <div class="sticky top-0 left-0 z-10 flex items-center w-full gap-1 pb-2 bg-background">
        <div class="relative w-full">
          <Input v-model="searchQuery" id="search" type="text" placeholder="Search..." class="pl-10" />
          <span class="absolute inset-y-0 flex items-center justify-center px-2 start-0">
              <Search class="size-6 text-muted-foreground" />
          </span>
        </div>
        <Button :disabled="status === 'pending'" variant="outline" @click="refresh" class="[&>*]:hover:animate-spin">
          <RefreshCcw class="w-4 h-4" />
        </Button>
    </div>

    <div class="h-[calc(100%-3rem)]">
      <ScrollArea class="h-full" v-if="filteredChats && (Array.isArray(filteredChats) && filteredChats?.length !== 0)">
        <div class="flex flex-col h-full gap-1">
          <div class="flex justify-between w-full gap-8 p-4 border rounded-sm border-border bg-background" :id="String(chat?.id)" v-for="chat in filteredChats" :key="chat?.id" v-bind:class="{ 'border border-green-600': selectedChat?.id === chat?.id }">
            <div class="flex flex-col gap-1">
              <div class="flex items-center gap-1">
                <template v-if="chatToEdit.id === chat.id">
                  <Input @keydown.enter="saveEdit(chat.id)" v-model="chatToEdit.name" />
                  <Button variant="outline" @click="saveEdit(chat.id)">Save</Button>
                </template>
                <template v-else>
                  <Button :variant="(selectedChat?.id === chat?.id ? 'secondary' : 'outline')" @click="setSelectedChat(chat.id, chat.name, chat.model)">{{ chat?.name }}</Button>
                  <Button variant="outline" @click="editChat(chat.id, chat.name)"><Pen class="w-4 h-4" /></Button>
                </template>
              </div>
              <Button variant="destructive" @click="deleteChat(chat?.id)">delete<Trash2 class="w-4 h-4 ml-1" /></Button>
            </div>
            <div class="grid text-right">
              <span class="truncate text-muted-foreground">{{ chat?.model }}</span>
              <NuxtTime class="text-muted-foreground" :datetime="chat?.created_at ?? new Date()" day="numeric" month="numeric" year="numeric" hour="numeric" minute="numeric" />
              <NuxtTime class="text-muted-foreground" :datetime="chat?.updated_at ?? new Date()" day="numeric" month="numeric" year="numeric" hour="numeric" minute="numeric" />
            </div>
          </div>
        </div>
      </ScrollArea>
      <div class="pt-2 text-center" v-else>
        <p v-if="(Array.isArray(data?.chats) && data?.chats?.length === 0)">No Chats yet... ({{ status }})</p>
        <p v-else>No search results... ({{ status }})</p>
        <p v-if="error">{{ error.message }} ({{ error.data.data }})</p>
      </div> 
    </div>
  </div>
</template>

<style scoped></style>
