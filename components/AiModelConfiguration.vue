<script setup lang="ts">
import { Bird, Rabbit, Dog } from 'lucide-vue-next'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useSelectedModel } from '~/composables/useSelectedModel';

const selectedModel = useSelectedModel()

function logSelectedModelInfo() {
    console.log(selectedModel.value);
}

// TODO: selectItem options in configuration variable/file
</script>

<template>
    <form class="grid items-start w-full gap-6 p-2">
        <fieldset class="grid gap-6 p-4 border rounded-lg">
            <legend class="px-1 -ml-1 text-sm font-medium">
                Settings
            </legend>
            <div class="grid gap-3">
                <Label for="model">Model</Label>
                <Select v-model="selectedModel" @update:model-value="logSelectedModelInfo" default-value="OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5" :default-open="true">
                    <SelectTrigger id="model" class="items-start [&_[data-description]]:hidden">
                        <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5">
                            <div class="flex items-start gap-3 text-muted-foreground">
                                <Dog class="size-5" />
                                <div class="grid gap-0.5">
                                    <p>
                                        OpenAssistant
                                        <span class="font-medium text-foreground">
                                            oasst-sft-4-pythia-12b-epoch-3.5
                                        </span>
                                    </p>
                                    <p class="text-xs" data-description>
                                        <strong>OpenAssistant collected data from over 13'000 humans and released it to the public.</strong><br>
                                        Data, models, and code are publicly available.<br>
                                        (Apache-2.0 License)
                                    </p>
                                </div>
                            </div>
                        </SelectItem>
                        <SelectItem value="01-ai/Yi-1.5-34B-Chat">
                            <div class="flex items-start gap-3 text-muted-foreground">
                                <Rabbit class="size-5" />
                                <div class="grid gap-0.5">
                                    <p>
                                        01-ai
                                        <span class="font-medium text-foreground">
                                            Yi-1.5-34B-Chat
                                        </span>
                                    </p>
                                    <p class="text-xs" data-description>
                                        <strong>Our vision: Make AGI Accessible and Beneficial to Everyone.</strong><br>
                                        01.AI vision: AI will effectively enhance human productivity, hence creating significant economic and societal values,
                                        <br>realizing 01.AI's aspiration of "Human + AI" that technology empowers and amplifies our humankind.
                                        <br>We hope to be able to contribute to this new AI 2.0 ecosystem.<br>
                                        (Apache-2.0 License)
                                    </p>
                                </div>
                            </div>
                        </SelectItem>
                        <SelectItem value="mistralai/Mistral-7B-Instruct-v0.2">
                            <div class="flex items-start gap-3 text-muted-foreground">
                                <Bird class="size-5" />
                                <div class="grid gap-0.5">
                                    <p>
                                        mistralai
                                        <span class="font-medium text-foreground">
                                            Mistral-7B-Instruct-v0.2
                                        </span>
                                    </p>
                                    <p class="text-xs" data-description>
                                        <strong>Frontier AI in your hands</strong><br>
                                        The open-weights models are highly efficient and available under a fully permissive Apache 2 license.<br>
                                        They are ideal for customization, such as fine-tuning, due to their portability, control, and fast performance.<br>
                                        (Apache-2.0 License)
                                    </p>
                                </div>
                            </div>
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </fieldset>
    </form>
</template>

<style scoped></style>
