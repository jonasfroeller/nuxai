<script setup lang="ts"></script>

<template>
  <div>
    <DynamicHeader />
    <main class="overflow-x-hidden border-t">
      <!-- INFO: overflow-x-hidden breaks position sticky... -->
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
