<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { Label } from '@/components/ui/label'
import Button from './ui/button/Button.vue';
import Input from './ui/input/Input.vue';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ALLOWED_AI_MODELS, POSSIBLE_AI_MODELS } from '~/lib/types/ai.models';

const selectedModel = useSelectedAiModel()
const randomId = useId();
const chatName = ref(`chat-${randomId}`);
let isPlayground = ref(true);
</script>

<template>
    <form class="grid items-start w-full gap-6">
        <fieldset class="grid gap-6 p-4 border rounded-lg">
            <legend class="px-1 -ml-1 text-sm font-medium">
                Settings
            </legend>
            <div class="grid gap-3">
                <Label for="model">Model</Label>
                <Select v-model="selectedModel" default-value="OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5">
                    <SelectTrigger id="model" class="items-start [&_[data-description]]:hidden">
                        <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem :value="model" v-for="model in ALLOWED_AI_MODELS">
                            <div class="flex items-start gap-3 text-muted-foreground">
                                <Icon :icon="POSSIBLE_AI_MODELS[model.split('/')[0]][model.split('/')[1]]['icon']" :ssr="true" width="20" height="20" />
                                <div class="grid gap-0.5">
                                    <p>
                                        {{ POSSIBLE_AI_MODELS[model.split('/')[0]][model.split('/')[1]]['publisher'] }}
                                        <span class="font-medium text-foreground">
                                            {{ POSSIBLE_AI_MODELS[model.split('/')[0]][model.split('/')[1]]['name'] }}
                                        </span>
                                    </p>
                                    <p class="text-xs" data-description v-html="POSSIBLE_AI_MODELS[model.split('/')[0]][model.split('/')[1]]['description']"></p>
                                </div>
                            </div>
                        </SelectItem>
                    </SelectContent>
                </Select>
                <div class="grid grid-cols-[1fr_auto] gap-1">
                    <Input id="chat-name" type="text" v-model="chatName" placeholder="Name of the chat... (optional)" />
                    <Button type="button" variant="secondary" :disabled="!isPlayground">Persist Chat History</Button>
                </div>
            </div>
        </fieldset>
    </form>
</template>

<style scoped></style>
