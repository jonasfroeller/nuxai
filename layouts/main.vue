<script setup lang="ts"></script>

<template>
  <DynamicHeader />
  <main>
    <slot />
  </main>
  <DynamicFooter />
</template>

<style scoped>
  main {
    padding: 4rem;
  }
</style>
