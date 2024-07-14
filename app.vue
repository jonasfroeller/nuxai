<script setup lang="ts">
import { Toaster } from '@/components/ui/sonner';

const main_layout = 'main'

/* const { data, pending } = await useFetch("", {
    lazy: true
}) */
</script>

<template>
  <Toaster />
  <NuxtLoadingIndicator color="hsl(var(--primary) / 0.9)" errorColor="hsl(var(--destructive))" :height="3"
    :duration="2000" :throttle="200" />
  <!-- when it shows: https://github.com/nuxt/nuxt/issues/18630, https://nuxt.com/docs/api/composables/use-loading-indicator -->
  <DynamicMeta :key="$route.path" /> <!-- key is needed, so that the component is rerendered without a prop change -->
  <div> <!-- needed for transitions to work properly -->
    <NuxtRouteAnnouncer />
    <NuxtLayout :name="main_layout">
      <NuxtPage />
    </NuxtLayout>
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