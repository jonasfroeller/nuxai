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

// TODO: fix `[Vue warn]: Hydration node mismatch` on some ShadcnTooltip
</script>

<template>
  <div class="grid w-full pl-16">
    <aside
      class="fixed top-0 left-0 flex flex-col h-full border-t border-r inset-y bg-[hsl(var(--background))] z-50"
    >
      <div class="p-2 border-b">
        <ShadcnButton variant="outline" size="icon" aria-label="Home" as-child>
          <NuxtLink to="/home">
            <Home class="size-5 fill-foreground" />
          </NuxtLink>
        </ShadcnButton>
      </div>
      <nav class="grid gap-1 p-2">
        <ShadcnTooltipProvider>
          <ShadcnTooltip>
            <ShadcnTooltipTrigger as-child>
              <ShadcnButton
                variant="ghost"
                size="icon"
                class="rounded-lg bg-muted"
                aria-label="Playground"
              >
                <SquareTerminal class="size-5" />
              </ShadcnButton>
            </ShadcnTooltipTrigger>
            <ShadcnTooltipContent side="right" :side-offset="5">
              Playground
            </ShadcnTooltipContent>
          </ShadcnTooltip>
          <ShadcnTooltip>
            <ShadcnTooltipTrigger as-child>
              <ShadcnButton
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
              </ShadcnButton>
            </ShadcnTooltipTrigger>
            <ShadcnTooltipContent side="right" :side-offset="5">
              Documentation
              <!-- TODO: waiting for https://github.com/scalar/scalar/issues/2431 -->
            </ShadcnTooltipContent>
          </ShadcnTooltip>
          <ShadcnTooltip>
            <ShadcnDialog>
              <ShadcnDialogTrigger as-child>
                <ShadcnTooltipTrigger as-child>
                  <ShadcnButton
                    variant="ghost"
                    size="icon"
                    class="rounded-lg"
                    aria-label="Settings"
                  >
                    <Settings2 class="size-5" />
                  </ShadcnButton>
                </ShadcnTooltipTrigger>
                <ShadcnTooltipContent side="right" :side-offset="5">
                  Settings
                </ShadcnTooltipContent>
              </ShadcnDialogTrigger>
              <ShadcnDialogContent class="sm:max-w-md">
                <ShadcnDialogHeader>
                  <ShadcnDialogTitle>Settings</ShadcnDialogTitle>
                  <ShadcnDialogDescription
                    >Theme Settings</ShadcnDialogDescription
                  >
                </ShadcnDialogHeader>
                <div class="flex items-center space-x-2">
                  <ThemeToggle />
                </div>
                <ShadcnDialogFooter class="sm:justify-start">
                  <ShadcnDialogClose as-child>
                    <ShadcnButton type="button" variant="secondary">
                      Close
                    </ShadcnButton>
                  </ShadcnDialogClose>
                </ShadcnDialogFooter>
              </ShadcnDialogContent>
            </ShadcnDialog>
          </ShadcnTooltip>
        </ShadcnTooltipProvider>
      </nav>
      <nav class="grid gap-1 p-2 mt-auto">
        <ShadcnTooltipProvider>
          <ShadcnTooltip>
            <ShadcnTooltipTrigger as-child>
              <ShadcnButton
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
              </ShadcnButton>
            </ShadcnTooltipTrigger>
            <ShadcnTooltipContent side="right" :side-offset="5">
              Help
            </ShadcnTooltipContent>
          </ShadcnTooltip>
          <ShadcnTooltip>
            <ShadcnTooltipTrigger as-child>
              <ShadcnButton
                variant="ghost"
                size="icon"
                class="mt-auto rounded-lg"
                aria-label="Account"
                as-child
              >
                <NuxtLink to="/account">
                  <SquareUser class="size-5" />
                </NuxtLink>
              </ShadcnButton>
            </ShadcnTooltipTrigger>
            <ShadcnTooltipContent side="right" :side-offset="5">
              Account
            </ShadcnTooltipContent>
          </ShadcnTooltip>
        </ShadcnTooltipProvider>
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
          <ShadcnButton
            variant="outline"
            size="sm"
            class="ml-auto gap-1.5 text-sm truncate"
            disabled
          >
            <Import class="size-3.5" />
            <!-- Import Code Repository To Analyze -->
          </ShadcnButton>
          <ShadcnButton
            variant="outline"
            size="sm"
            class="ml-auto gap-1.5 text-sm truncate"
            disabled
          >
            <Share class="size-3.5" />
            <!-- Share -->
          </ShadcnButton>
        </div>
      </header>
      <Dashboard />
    </div>
  </div>
</template>

<style scoped></style>
