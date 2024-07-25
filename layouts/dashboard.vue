<script setup lang="ts"></script>

<template>
  <div class="relative">
    <DynamicHeader class="pl-[5rem]" />
    <main class="border-t">
      <slot />
    </main>
    <DynamicFooter />
  </div>
</template>

<style scoped>
main {
  padding: 4rem 0;
  padding-top: 0;
  min-height: 100vh;
}
</style>
