<script setup lang="ts">
    import { Mic, Paperclip, Link, CornerDownLeft, RefreshCcw, Trash2, Delete } from 'lucide-vue-next'
    import { Button } from '@/components/ui/button'
    import Input from './ui/input/Input.vue'
    import { Badge } from "@/components/ui/badge"
    import { ScrollArea } from "@/components/ui/scroll-area"
    import { Textarea } from '@/components/ui/textarea'
    import {
      Tooltip,
      TooltipContent,
      TooltipProvider,
      TooltipTrigger,
    } from "@/components/ui/tooltip"
    import {
        Popover,
        PopoverContent,
        PopoverTrigger,
    } from '@/components/ui/popover'
    import { useChat } from '@ai-sdk/vue'
    import { Label } from "@/components/ui/label"
    import { toast } from 'vue-sonner'

    /* const props = defineProps<{
        selectedModel?: AllowedModelPaths
    }>() */ /* TODO: maybe allow too in the future */

    /* CHAT AI */
    const selectedModelApiPath = useSelectedAiModelApiPath()
    let { messages, input, handleSubmit, reload, isLoading } = useChat({
        api: selectedModelApiPath.value
    });

    /* TEXT RECOGNITION */
    const {
        isSupported,
        isListening,
        result,
        start,
        stop,
        error
    } = useSpeechRecognition({
        lang: 'en-US',
        interimResults: true,
        continuous: true,
    })

    watch(error, async () => {
        if (error.value?.error === "not-allowed") {
            toast.error("Speech recognition was disabled for this page!\nPlease allow it, to use the feature!");
        } else {
            toast.error(`Speech recognition error! (${error.value?.error})`);
        }
    })

    if (isSupported.value && IS_CLIENT) {
        watch(result, () => {
            input.value = result.value
        })
    }

    /* LOADING INDICATOR */
    let toastIdAiIsResponding: string | number;
    let toastIdAiIsNotResponding: string | number;
    watch(isLoading, (newValue, oldValue) => {
        if (!newValue) {
            if (IS_CLIENT) {
                toastIdAiIsNotResponding = toast.success("AI is done responding!");
                toast.dismiss(toastIdAiIsResponding);
            }
        } else if (newValue) {
            if (IS_CLIENT) {
                toastIdAiIsResponding = toast.loading("AI is responding...");
                toast.dismiss(toastIdAiIsNotResponding);
            }
        }
    });

    /* CONVERT HTML TO MARKDOWN */
    let urlToFetchHtmlFrom = ref("");
    async function getMarkdownOfUrl(url: string) {
        const endpoint = "/api/html-to-markdown/";
        const encodedUrl = encodeURIComponent(url);

        const fetchPromise = new Promise(async (resolve, reject) => {
            await useFetch(`${endpoint}${encodedUrl}`, {
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

        if (IS_CLIENT) {
            toast.promise(fetchPromise, {
                loading: 'Fetching url and converting it\'s HTML content to markdown...',
                success: (data: any) => "Successfully fetched the url and converted it\'s HTML content to markdown!",
                error: (data: any) => "Failed to fetch the url and convert it\'s HTML content to markdown!",
            })
        }

        const markdownOfUrl = await fetchPromise;
        input.value = input.value + markdownOfUrl;
    }
</script>

<template>
    <div class="relative flex flex-col h-full min-h-[60vh] max-h-[75vh] rounded-xl bg-muted/50 p-4 w-[100%-2rem] order-1 2xl:order-2">
        <Badge variant="outline" class="absolute z-10 right-3 top-3 bg-background">
            Chat
        </Badge>

        <ScrollArea class="flex flex-col flex-grow max-w-full min-h-0 pt-8 pb-6">
            <div v-for="m in messages" :key="m.id" class="flex my-2" v-bind:class="{ 'justify-start': m.role === 'assistant', 'justify-end': m.role === 'user' }">
                <div v-if="m.role === 'assistant'" class="px-4 py-2 border rounded-lg bg-background border-slate-200 max-w-[80%]">
                    <ClientOnly>
                        <MDC class="overflow-x-auto break-words whitespace-pre-wrap" :value="m.content" />
                    </ClientOnly>
                </div>

                <div v-if="m.role === 'user'" class="px-4 py-2 border rounded-lg bg-background border-slate-200 max-w-[80%]">
                    <ClientOnly>
                        <MDC class="overflow-x-auto break-words whitespace-pre-wrap" :value="m.content" />
                    </ClientOnly>
                </div>
            </div>

            <!-- Input draft -->
            <div class="flex justify-end mt-8 overflow-auto" v-if="input.trim() !== ''">
                <div class="break-words whitespace-pre-wrap max-w-[80%] border border-orange-300 rounded-lg bg-background px-4 py-2">
                    {{ input }}
                </div>
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
            class="p-3 border-0 shadow-none resize-none max-h-28 focus-visible:ring-0" />
            <div class="flex items-center p-3 pt-0">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger as-child>
                            <Button type="button" variant="ghost" size="icon" disabled>
                                <Paperclip class="size-4" />
                                <span class="sr-only">Attach file</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                            Attach File
                        </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <Popover>
                            <PopoverTrigger as-child>
                                <TooltipTrigger as-child>
                                    <Button type="button" variant="ghost" size="icon">
                                        <Link class="size-4" />
                                        <span class="sr-only">URL context</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                    URL context
                                </TooltipContent>
                            </PopoverTrigger>
                            <PopoverContent>
                                <div class="grid gap-2 mb-1">
                                    <Label for="url">URL</Label>
                                    <Input id="url" type="url" name="url" v-model="urlToFetchHtmlFrom" placeholder="https://example.com" required />
                                </div>
                                <Button type="button" variant="outline" class="w-full" @click="getMarkdownOfUrl(urlToFetchHtmlFrom)">Add URL for further context</Button>
                            </PopoverContent>
                        </Popover>
                    </Tooltip>
                    <Tooltip v-if="isSupported">
                        <TooltipTrigger as-child>
                            <ClientOnly>
                                <Button type="button" variant="ghost" size="icon" v-bind:class="{ 'animate-pulse outline-1 outline-destructive outline-dashed': isListening }" @click="() => {
                                        if (isListening) {
                                            console.log('stopping listening');
                                            stop();
                                        } else {
                                            console.log('starting listening');
                                            start();
                                        }
                                    }">
                                    <Mic class="size-4" />
                                    <span class="sr-only">Use Microphone</span>
                                </Button>
                            </ClientOnly>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                            Use Microphone
                        </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger as-child>
                            <Button type="button" variant="ghost" size="icon" @click="() => messages = []" :disabled="isLoading || messages.length === 0">
                                <Trash2 class="size-4" />
                                <span class="sr-only">Clear Chat</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                            Clear
                        </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger as-child>
                            <Button type="button" variant="ghost" size="icon" @click="reload" :disabled="isLoading || messages.length === 0">
                                <RefreshCcw class="size-4" />
                                <span class="sr-only">Refresh Last Response</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                            Refresh (needed if ai is stuck)
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <div class="flex items-center gap-1 ml-auto">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger as-child>
                                <Button type="button" variant="outline" size="icon" @click="input = ''" :disabled="input === ''">
                                    <Delete class="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                                Clear Input
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <Button type="submit" size="sm" class="gap-1.5" :disabled="isLoading || input === ''">
                        Send Message
                        <CornerDownLeft class="size-3.5" />
                    </Button>
                </div>
            </div>
        </form>
    </div>
</template>

<style scoped></style>
