<script setup lang="ts">
import { ConfigProvider } from 'radix-vue';

const router = useRouter();
const currentRouteName = computed(() => router.currentRoute.value.name);
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
      <ShadcnToaster closeButton />
      <NuxtLoadingIndicator
        color="hsl(var(--primary) / 0.9)"
        errorColor="hsl(var(--destructive))"
        :height="3"
        :duration="2000"
        :throttle="200"
      />
      <!-- when it shows: https://github.com/nuxt/nuxt/issues/18630, https://nuxt.com/docs/api/composables/use-loading-indicator -->
      <DynamicMeta :key="currentRouteName" />
      <!-- key is needed, so that the component is rerendered without a prop change -->
      <div>
        <!-- needed for transitions to work properly -->
        <NuxtRouteAnnouncer />
        <!-- :name="main_layout" -->
        <NuxtLayout>
          <NuxtPage />
        </NuxtLayout>
        <!-- <NuxtPage /> -->
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
