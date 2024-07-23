<script setup lang="ts">
import { ALLOWED_AI_MODELS, POSSIBLE_AI_MODELS } from '~/lib/types/ai.models';

const { user } = useUserSession();
const {
  selectedAiChat,
  selectedAiChatId,
  selectedAiChatIsPlayground,
  resetSelectedAiChatToDefaults,
} = useSelectedAiChat();
const selectedModel = useSelectedAiModel();
const { persistChatConversation } = useAPI();

const {
  messages: currentAiChatPlaygroundMessagesBackup,
  name: currentAiChatPlaygroundName,
} = useAiChatPlayground();
</script>

<template>
  <DevOnly>
    {{ selectedAiChatId }} / {{ `${selectedModel}?chat_id=${selectedAiChatId}`
    }}<br />
    SELECTED: {{ selectedAiChat }}<br />
    PLAYGROUND: {{ JSON.stringify(currentAiChatPlaygroundName) }} /
    {{ JSON.stringify(currentAiChatPlaygroundMessagesBackup) }}
  </DevOnly>

  <form class="grid items-start w-full gap-6">
    <fieldset class="grid gap-6 p-4 border rounded-lg">
      <legend class="px-1 -ml-1 text-sm font-medium">Settings</legend>
      <div class="grid gap-3">
        <ShadcnLabel for="model">Model</ShadcnLabel>
        <ShadcnSelect
          v-model="selectedModel"
          default-value="OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5"
        >
          <ShadcnSelectTrigger
            :disabled="!selectedAiChatIsPlayground"
            id="model"
            class="items-start [&_[data-description]]:hidden"
          >
            <ShadcnSelectValue placeholder="ShadcnSelect a model" />
          </ShadcnSelectTrigger>
          <ShadcnSelectContent>
            <ShadcnSelectItem :value="model" v-for="model in ALLOWED_AI_MODELS">
              <div class="flex items-start gap-3 text-muted-foreground">
                <ShadcnIcon
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
            </ShadcnSelectItem>
          </ShadcnSelectContent>
        </ShadcnSelect>
        <div class="grid grid-cols-[1fr_auto] gap-1">
          <ShadcnInput
            :disabled="!selectedAiChatIsPlayground"
            id="chat-name"
            type="text"
            v-model="selectedAiChat.name"
            placeholder="Name of the chat... (optional)"
          />
          <ShadcnButton
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
            >Persist Chat History</ShadcnButton
          >
        </div>
        <ShadcnButton
          :disabled="selectedAiChatIsPlayground"
          type="button"
          variant="secondary"
          @click="() => resetSelectedAiChatToDefaults()"
          >New Playground Chat</ShadcnButton
        >
      </div>
    </fieldset>
  </form>
</template>

<style scoped></style>
