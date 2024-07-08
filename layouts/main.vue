<script setup lang="ts"></script>

<template>
  <div>
    <DynamicHeader />
    <main>
      <slot />
    </main>
    <DynamicFooter />
  </div>
</template>

<style scoped>
main {
  padding: 4rem;
  min-height: 100vh;
}
</style>
