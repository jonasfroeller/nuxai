<script setup lang="ts">
import {
  Book,
  LifeBuoy,
  Settings2,
  Share,
  Import,
  SquareTerminal,
  SquareUser,
  Home,
} from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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
  layout: 'dashboard',
  alias: dashboardAliases,
});

const headerNavigationStore = useHeaderNavigationStore();
const { headerNavigationElement } = storeToRefs(headerNavigationStore);

const headerNavigationHeight = ref(0);
watch(headerNavigationElement, (newHeaderNavigationElement) => {
  const { height } = useElementSize(newHeaderNavigationElement); // needs access to lifecycle hooks (that is why it is not defined in the store or a composable)
  headerNavigationHeight.value = height.value;
});

// TODO: fix `[Vue warn]: Hydration node mismatch` on some Tooltip
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
                type="button"
              >
                <NuxtLink
                  download="openapi.json"
                  to="/docs/openapi.json"
                  external
                >
                  <Book class="size-5" />
                </NuxtLink>
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
        class="sticky left-0 z-20 flex items-center justify-between gap-1 py-2 border-b bg-background"
        :style="{ top: headerNavigationHeight + 'px' }"
      >
        <div class="flex items-center gap-2">
          <h1 class="text-xl font-semibold truncate">Chat</h1>
        </div>
        <div class="flex gap-2 pr-5">
          <Button
            variant="outline"
            size="sm"
            class="ml-auto gap-1.5 text-sm truncate"
            disabled
          >
            <Import class="size-3.5" />
            <!-- Import Code Repository To Analyze -->
          </Button>
          <Button
            variant="outline"
            size="sm"
            class="ml-auto gap-1.5 text-sm truncate"
            disabled
          >
            <Share class="size-3.5" />
            <!-- Share -->
          </Button>
        </div>
      </header>
      <Dashboard />
    </div>
  </div>
</template>

<style scoped></style>
