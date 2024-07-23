<script setup lang="ts">
import {
  Book,
  LifeBuoy,
  Settings,
  Settings2,
  Share,
  Import,
  SquareTerminal,
  SquareUser,
  Home,
} from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

definePageMeta({
  name: 'Dashboard',
  middleware: ['protected'],
  alias: ['/dashboard', '/chat'],
});

const selectedModelApiPath = useSelectedAiModelApiPath(); // TODO: find out, how to recreate useChat on selectedModelApiPath => this wouldn't be needed anymore
const { selectedAiChat } = useSelectedAiChat();
const aiChatKey = computed(
  () => `${selectedModelApiPath.value}?=${selectedAiChat.value.id}`
);
</script>

<template>
  <div class="grid w-full pl-16">
    <aside
      class="fixed top-0 left-0 flex flex-col h-full border-t border-r inset-y bg-[hsl(var(--background))] z-50"
    >
      <div class="p-2 border-b">
        <Button variant="outline" size="icon" aria-label="Home" as-child>
          <NuxtLink to="/home">
            <Home class="size-5 fill-foreground" />
          </NuxtLink>
        </Button>
      </div>
      <nav class="grid gap-1 p-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger as-child>
              <Button
                variant="ghost"
                size="icon"
                class="rounded-lg bg-muted"
                aria-label="Playground"
              >
                <SquareTerminal class="size-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" :side-offset="5">
              Playground
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger as-child>
              <Button
                variant="ghost"
                size="icon"
                class="rounded-lg"
                aria-label="Documentation"
              >
                <Book class="size-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" :side-offset="5">
              Documentation
              <!-- TODO: waiting for https://github.com/scalar/scalar/issues/2431 -->
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <Dialog>
              <DialogTrigger as-child>
                <TooltipTrigger as-child>
                  <Button
                    variant="ghost"
                    size="icon"
                    class="rounded-lg"
                    aria-label="Settings"
                  >
                    <Settings2 class="size-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" :side-offset="5">
                  Settings
                </TooltipContent>
              </DialogTrigger>
              <DialogContent class="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Settings</DialogTitle>
                  <DialogDescription>Theme Settings</DialogDescription>
                </DialogHeader>
                <div class="flex items-center space-x-2">
                  <ThemeToggle />
                </div>
                <DialogFooter class="sm:justify-start">
                  <DialogClose as-child>
                    <Button type="button" variant="secondary"> Close </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </Tooltip>
        </TooltipProvider>
      </nav>
      <nav class="grid gap-1 p-2 mt-auto">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger as-child>
              <Button
                variant="ghost"
                size="icon"
                class="mt-auto rounded-lg"
                aria-label="Help"
                as-child
              >
                <NuxtLink
                  external
                  to="https://github.com/jonasfroeller/nuxt-chat-app/issues/new"
                  target="_blank"
                >
                  <LifeBuoy class="size-5" />
                </NuxtLink>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" :side-offset="5">
              Help
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger as-child>
              <Button
                variant="ghost"
                size="icon"
                class="mt-auto rounded-lg"
                aria-label="Account"
                as-child
              >
                <NuxtLink to="/account">
                  <SquareUser class="size-5" />
                </NuxtLink>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" :side-offset="5">
              Account
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </nav>
    </aside>
    <div class="flex flex-col">
      <header
        class="sticky top-[4.8rem] z-20 flex h-[53px] items-center gap-1 border-b bg-background px-4 justify-between"
      >
        <div class="flex items-center gap-2">
          <h1 class="text-xl font-semibold">Configuration Generator</h1>
          <Drawer>
            <DrawerTrigger as-child>
              <Button variant="ghost" size="icon" class="md:hidden">
                <Settings class="size-4" />
                <span class="sr-only">Settings</span>
              </Button>
            </DrawerTrigger>
            <DrawerContent class="max-h-[80vh]">
              <DrawerHeader>
                <DrawerTitle>Configuration</DrawerTitle>
                <DrawerDescription>
                  Configure the settings for the model
                </DrawerDescription>
              </DrawerHeader>
              <AiModelConfiguration :key="aiChatKey" />
            </DrawerContent>
          </Drawer>
        </div>
        <div class="flex gap-2 pr-5">
          <Button variant="outline" size="sm" class="ml-auto gap-1.5 text-sm">
            <Import class="size-3.5" />
            Import Code Repository To Analyze
          </Button>
          <Button variant="outline" size="sm" class="ml-auto gap-1.5 text-sm">
            <Share class="size-3.5" />
            Share
          </Button>
        </div>
      </header>
      <main
        class="grid flex-1 w-full max-w-full grid-cols-1 gap-4 p-4 2xl:grid-cols-[33%,1fr]"
      >
        <!-- <ClientOnly> -->
        <!-- TODO: fix tab hydration warning -->
        <Tabs default-value="chat" class="h-screen max-h-[calc(100%-3rem)]">
          <TabsList class="flex justify-start w-full bg-muted/50">
            <TabsTrigger value="chats"> All Chats </TabsTrigger>
            <TabsTrigger value="chat"> Active Chat Information </TabsTrigger>
          </TabsList>
          <TabsContent value="chats" class="h-full">
            <AiChats />
          </TabsContent>
          <TabsContent value="chat" class="h-full">
            <AiChatInformation :key="aiChatKey" />
          </TabsContent>
        </Tabs>
        <AiModelChat :key="aiChatKey" />
        <!-- </ClientOnly> -->
      </main>
      <DevOnly>
        <div class="text-center">{{ aiChatKey }}</div>
      </DevOnly>
    </div>
  </div>
</template>

<style scoped></style>
