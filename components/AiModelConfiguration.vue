<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { Label } from '@/components/ui/label';
import Button from './ui/button/Button.vue';
import Input from './ui/input/Input.vue';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ALLOWED_AI_MODELS, POSSIBLE_AI_MODELS } from '~/lib/types/ai.models';
// import { useChat } from '@ai-sdk/vue';

// improves ux
const { persistChatConversation } = useAPI();

const { user } = useUserSession();
const { selectedAiChat, selectedAiChatId, selectedAiChatIsPlayground, resetSelectedAiChatToDefaults } = useSelectedAiChat();
const selectedModel = useSelectedAiModel();

const { messages: currentAiChatPlaygroundMessagesBackup, name: currentAiChatPlaygroundName } = useAiChatPlayground();

/* const { messages } = useChat({ // TODO: messages are not updated properly. set currentAiChatPlaygroundMessagesBackup on sendMessage in AiModelChat
  id: String(selectedAiChatId),
  api: `${selectedModel}?chat_id=${selectedAiChatId}`,
  keepLastMessageOnError: true,
}); */

// causes "Could not get current instance, check to make sure that `useSwrv` is declared in the top level of the setup function.""
/* async function persistChatHistory() {
  const { messages } = useChat({
    id: String(selectedChat.value.id),
    api: `${selectedModel}?chat_id=${selectedChat.value.id}`,
    keepLastMessageOnError: true,
  });
  
  console.log('persisting chat history...');

  chatMessagesBackup.value = messages.value;

  console.log('chatMessagesBackup', chatMessagesBackup.value);

  selectedChat.value.id = await persistChatConversation(
    user?.value?.id ?? -1,
    selectedChat.value.name,
    selectedChat.value.model,
  );
} */
</script>

<template>
  <DevOnly>
    {{ selectedAiChatId }} | {{ `${selectedModel}?chat_id=${selectedAiChatId}` }}<br>
    SELECTED: {{ selectedAiChat }}<br>
    <!-- {{ messages }} -->
    PLAYGROUND: {{ JSON.stringify(currentAiChatPlaygroundMessagesBackup) }} / {{ JSON.stringify(currentAiChatPlaygroundName) }}
  </DevOnly>

  <form class="grid items-start w-full gap-6">
    <fieldset class="grid gap-6 p-4 border rounded-lg">
      <legend class="px-1 -ml-1 text-sm font-medium">Settings</legend>
      <div class="grid gap-3">
        <Label for="model">Model</Label>
        <Select
          v-model="selectedModel"
          default-value="OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5"
        >
          <SelectTrigger
            :disabled="!selectedAiChatIsPlayground"
            id="model"
            class="items-start [&_[data-description]]:hidden"
          >
            <SelectValue placeholder="Select a model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem :value="model" v-for="model in ALLOWED_AI_MODELS">
              <div class="flex items-start gap-3 text-muted-foreground">
                <Icon
                  :icon="
                    POSSIBLE_AI_MODELS[model.split('/')[0]][
                      model.split('/')[1]
                    ]['icon']
                  "
                  :ssr="true"
                  width="20"
                  height="20"
                />
                <div class="grid gap-0.5">
                  <p>
                    {{
                      POSSIBLE_AI_MODELS[model.split('/')[0]][
                        model.split('/')[1]
                      ]['publisher']
                    }}
                    <span class="font-medium text-foreground">
                      {{
                        POSSIBLE_AI_MODELS[model.split('/')[0]][
                          model.split('/')[1]
                        ]['name']
                      }}
                    </span>
                  </p>
                  <p
                    class="text-xs"
                    data-description
                    v-html="
                      POSSIBLE_AI_MODELS[model.split('/')[0]][
                        model.split('/')[1]
                      ]['description']
                    "
                  ></p>
                </div>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        <div class="grid grid-cols-[1fr_auto] gap-1">
          <Input
            :disabled="!selectedAiChatIsPlayground"
            id="chat-name"
            type="text"
            v-model="selectedAiChat.name"
            placeholder="Name of the chat... (optional)"
          />
          <Button
            :disabled="!selectedAiChatIsPlayground"
            type="button"
            variant="secondary"
            @click="
              async () => {
                selectedAiChat.id = await persistChatConversation(
                  user?.id ?? -1,
                  selectedAiChat.name,
                  selectedAiChat.model
                );
              }
            "
            >Persist Chat History</Button
          >
        </div>
        <Button
          :disabled="selectedAiChatIsPlayground"
          type="button"
          variant="secondary"
          @click="() => resetSelectedAiChatToDefaults()"
          >New Playground Chat</Button
        >
      </div>
    </fieldset>
  </form>
</template>

<style scoped></style>
