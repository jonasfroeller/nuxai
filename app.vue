<script setup lang="ts">
import { ConfigProvider } from 'radix-vue';
import { Toaster } from '@/components/ui/sonner';

// const main_layout = 'main';

/* useHead({
}) */

/* useSeoMeta({
}) */

const useSsrSaveId = () => useId();
</script>

<template>
  <div>
    <ConfigProvider :use-id="useSsrSaveId">
      <Toaster closeButton />
      <NuxtLoadingIndicator
        color="hsl(var(--primary) / 0.9)"
        errorColor="hsl(var(--destructive))"
        :height="3"
        :duration="2000"
        :throttle="200"
      />
      <!-- when it shows: https://github.com/nuxt/nuxt/issues/18630, https://nuxt.com/docs/api/composables/use-loading-indicator -->
      <DynamicMeta :key="$route.path" />
      <!-- key is needed, so that the component is rerendered without a prop change -->
      <div>
        <!-- needed for transitions to work properly -->
        <NuxtRouteAnnouncer />
        <NuxtLayout>
          <!-- :name="main_layout" -->
          <NuxtPage />
        </NuxtLayout>
      </div>
    </ConfigProvider>
  </div>
</template>

<style>
.page-enter-active,
.page-leave-active {
  transition: all 0.1s;
}

.page-enter-from {
  opacity: 0;
  transform: translate(-50px, 0);
}

.page-leave-to {
  opacity: 0;
  transform: translate(50px, 0);
}

.layout-enter-active,
.layout-leave-active {
  transition: all 0.1s;
}

.layout-enter-from,
.layout-leave-to {
  opacity: 0;
}
</style>
