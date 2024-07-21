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

// improves ux
const { persistChatConversation } = useAPI();

const { user } = useUserSession();
const selectedChat = useSelectedAiChat();
const selectedModel = useSelectedAiModel();
let isPlayground = computed(() => selectedChat.value.id === -1);
</script>

<template>
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
            :disabled="!isPlayground"
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
            :disabled="!isPlayground"
            id="chat-name"
            type="text"
            v-model="selectedChat.name"
            placeholder="Name of the chat... (optional)"
          />
          <Button
            :disabled="!isPlayground"
            type="button"
            variant="secondary"
            @click="
              async () => {
                selectedChat.id = await persistChatConversation(
                  user?.id ?? -1,
                  selectedChat.name,
                  selectedChat.model
                );
              }
            "
            >Persist Chat History</Button
          >
        </div>
        <Button
          :disabled="isPlayground"
          type="button"
          variant="secondary"
          @click="
            () => {
              selectedChat.id = -1;
              selectedChat.name = `chat-${Date.now()}`;
              selectedChat.model =
                'OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5';
            }
          "
          >New Playground Chat</Button
        >
      </div>
    </fieldset>
  </form>
</template>

<style scoped></style>
