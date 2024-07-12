<script setup lang="ts">
    import { Mic, Paperclip, CornerDownLeft } from 'lucide-vue-next'
    import { Button } from '@/components/ui/button'
    import { Badge } from "@/components/ui/badge"
    import { ScrollArea } from "@/components/ui/scroll-area"
    import { Textarea } from '@/components/ui/textarea'
    import {
      Tooltip,
      TooltipContent,
      TooltipProvider,
      TooltipTrigger,
    } from "@/components/ui/tooltip"
    import { useChat } from '@ai-sdk/vue'
    import { Label } from "@/components/ui/label"
    import { useSelectedModelApiPath } from '~/composables/useSelectedModel'

    /* const props = defineProps<{
        selectedModel?: AllowedModelPaths
    }>() */ /* maybe allow too in the future */

    const selectedModelApiPath = useSelectedModelApiPath()
    
    const apiPath = ref(selectedModelApiPath.value);
    const config = reactive({
        get api() {
            return apiPath.value;
        },
        set api(value) {
            apiPath.value = value;
        }
    });
    let { messages, input, handleSubmit, reload, isLoading } = useChat(config); // reload: Function to reload the last AI chat response for the given chat history. If the last message isn't from the assistant, it will request the API to generate a new response.

    watch(selectedModelApiPath, (newValue, oldValue) => {
        config.api = newValue;
        messages.value = [];
        input.value = '';
        isLoading.value = false;
        console.log(`selectedModelApiPath changed from ${oldValue} to ${newValue} (config: ${JSON.stringify(config)})`);
    });

    watch(isLoading, (newValue, oldValue) => {
        console.log(`isLoading changed from ${oldValue} to ${newValue}`);
    });
</script>

<template>
    <div class="relative flex flex-col h-full min-h-[25vh] max-h-[75vh] rounded-xl bg-muted/50 p-4 lg:col-span-2">
        <Badge variant="outline" class="absolute z-10 right-3 top-3 bg-background">
        Chat for <code class="pl-2">{{ selectedModelApiPath }}</code>
        </Badge>

        <ScrollArea class="flex flex-col flex-grow w-full min-h-0 pt-8 pb-6 mx-auto">
        <div v-for="m in messages" :key="m.id" class="whitespace-pre-wrap">
            <div class="flex justify-start my-2" v-if="m.role === 'assistant'">
            <ScrollArea class="bg-background border-slate-200 border w-fit px-4 py-2 rounded-lg whitespace-pre-wrap max-w-[50%]">
                <ClientOnly>
                    <MDC class="overflow-x-auto" :value="m.content" />
                </ClientOnly>
            </ScrollArea>
            </div>

            <div class="flex justify-end my-2" v-if="m.role === 'user'">
            <ScrollArea class="bg-background border-slate-200 border max-w-[80%] w-fit px-4 py-2 rounded-lg whitespace-pre-wrap">
                <ClientOnly>
                <MDC :value="m.content" />
                </ClientOnly>
            </ScrollArea>
            </div>
        </div>

        <!-- Input draft -->
        <div class="flex justify-end pt-8 max-h-96" v-if="input !== ''">
            <ScrollArea class="bg-slate-100 max-w-[80%] w-fit px-4 py-2 rounded-lg whitespace-pre-wrap border border-orange-300">
            {{ input }}
            </ScrollArea>
        </div>
        </ScrollArea>
        
        <form @submit="handleSubmit" class="relative flex-shrink-0 overflow-hidden border rounded-lg bg-background focus-within:ring-1 focus-within:ring-ring">
            <Label for="message" class="sr-only">
                Message
            </Label>
            <Textarea 
            v-model="input"
            id="message" 
            placeholder="Type your message here..."
            class="p-3 border-0 shadow-none resize-none min-h-12 focus-visible:ring-0" />
            <div class="flex items-center p-3 pt-0">
                <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger as-child>
                    <Button variant="ghost" size="icon">
                        <Paperclip class="size-4" />
                        <span class="sr-only">Attach file</span>
                    </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                        Attach File
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger as-child>
                    <Button variant="ghost" size="icon">
                        <Mic class="size-4" />
                        <span class="sr-only">Use Microphone</span>
                    </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                        Use Microphone
                    </TooltipContent>
                </Tooltip>
                </TooltipProvider>
                    <Button type="submit" size="sm" class="ml-auto gap-1.5">
                    Send Message
                    <CornerDownLeft class="size-3.5" />
                </Button>
            </div>
        </form>
    </div>
</template>

<style scoped></style>
