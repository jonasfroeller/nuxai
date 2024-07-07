<script setup lang="ts">
  const main_layout = 'main'
  const error_layout = 'error'
</script>

<template>
  <DynamicMeta :key="$route.path" /> <!-- key is needed, so that the component is rerendered without a prop change -->
  <NuxtRouteAnnouncer />
  <NuxtErrorBoundary>
      <template #error="{ error }">
        <NuxtLayout :name="error_layout">
          <p>An error occurred: {{ error }}</p>
        </NuxtLayout>
      </template>
  </NuxtErrorBoundary>
  <div> <!-- needed for transitions to work properly -->
    <NuxtLayout :name="main_layout">
      <NuxtLoadingIndicator />
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