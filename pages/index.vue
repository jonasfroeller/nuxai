<script setup lang="ts">
import { Book, Bot, Code2, LifeBuoy, Settings, Settings2, Share, Import, SquareTerminal, SquareUser, Triangle } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { Label } from '@/components/ui/label'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrentClientDate } from '~/lib/formatting'

definePageMeta({
  name: "Dashboard",
  middleware: ["protect"],
  alias: ['/dashboard', '/chat']
})

onErrorCaptured((error) => {
  console.log("error in index component", error);
})

const { formattedDate, fullDateString } = formatCurrentClientDate();
const selectedModelApiPath = useSelectedAiModelApiPath() // TODO: find out, how to recreate useChat on selectedModelApiPath => this wouldn't be needed anymore
</script>

<template>
  <div class="grid h-screen w-full pl-[53px]">
    <aside class="fixed top-0 left-0 flex flex-col h-full border-t border-r inset-y bg-[hsl(var(--background))] z-50">
      <div class="p-2 border-b">
        <Button variant="outline" size="icon" aria-label="Home">
          <Triangle class="size-5 fill-foreground" />
        </Button>
      </div>
      <nav class="grid gap-1 p-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger as-child>
              <Button variant="ghost" size="icon" class="rounded-lg bg-muted" aria-label="Playground">
                <SquareTerminal class="size-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" :side-offset="5">
              Playground
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger as-child>
              <Button variant="ghost" size="icon" class="rounded-lg" aria-label="Models">
                <Bot class="size-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" :side-offset="5">
              Models
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger as-child>
              <Button variant="ghost" size="icon" class="rounded-lg" aria-label="API">
                <Code2 class="size-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" :side-offset="5">
              API
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger as-child>
              <Button variant="ghost" size="icon" class="rounded-lg" aria-label="Documentation">
                <Book class="size-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" :side-offset="5">
              Documentation
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger as-child>
              <Button variant="ghost" size="icon" class="rounded-lg" aria-label="Settings">
                <Settings2 class="size-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" :side-offset="5">
              Settings
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </nav>
      <nav class="grid gap-1 p-2 mt-auto">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger as-child>
              <Button variant="ghost" size="icon" class="mt-auto rounded-lg" aria-label="Help">
                <LifeBuoy class="size-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" :side-offset="5">
              Help
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger as-child>
              <Button variant="ghost" size="icon" class="mt-auto rounded-lg" aria-label="Account">
                <SquareUser class="size-5" />
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
      <header class="sticky top-[4.8rem] z-20 flex h-[53px] items-center gap-1 border-b bg-background px-4 justify-between">
        <div class="flex items-center gap-2">
          <h1 class="text-xl font-semibold">
            Configuration Generator
          </h1>
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
              <AiModelConfiguration />
            </DrawerContent>
          </Drawer>
        </div>
        <div class="flex gap-2">
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
      <main class="grid flex-1 gap-4 p-4 overflow-auto md:grid-cols-2 lg:grid-cols-3">
        <div class="relative flex-col items-start hidden gap-8 md:flex">
          <AiModelConfiguration />
          <fieldset class="grid w-full gap-6 p-4 m-2 border rounded-lg">
            <legend class="px-1 -ml-1 text-sm font-medium">
              Generated Configuration File
            </legend>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <Label>Version ({{ formattedDate }})</Label>
                <Select :default-value="fullDateString">
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem :value="fullDateString ?? undefined">
                      {{ fullDateString }} (+200, -322)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Filetype</Label>
                <Select default-value="yaml">
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yaml">
                      yaml
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div class="grid gap-3">
              <Label for="content">Content of the selected version:</Label>
              <pre id="content" class="min-h-[9.5rem] max-h-[21.7rem] overflow-auto border rounded-sm px-4 py-2">
xxx
xxx
xxx
xxx
xxx
xxx
xxx
xxx
xxx
xxx
xxx
xxx
xxx
xxx
xxx
              </pre>
            </div>
          </fieldset>
        </div>
        <AiModelChat :key="selectedModelApiPath" />
      </main>
    </div>
  </div>
</template>

<style scoped></style>
