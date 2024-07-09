<script setup lang="ts"></script>

<template>
  <div>
    <DynamicHeader />
    <main class="border-t">
      <slot />
    </main>
    <DynamicFooter />
  </div>
</template>

<style scoped>
main {
  padding: 4rem;
  padding-top: 0;
  min-height: 100vh;
}
</style>
