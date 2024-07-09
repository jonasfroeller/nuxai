<script setup lang="ts">
import { Button } from "@/components/ui/button"

const { loggedIn, user, clear } = useUserSession()
</script>

<template>
  <header>
    <nav class="flex items-center justify-between gap-2 px-8 py-4 pl-[5rem]">
      <AppLinks layout="chips" />
      <div class="flex items-center gap-2">
        <Button v-if="loggedIn" @click="clear().finally(async () => await navigateTo('/home'))">Sign Out {{ user?.email
          }}</Button>
        <ThemeToggle />
      </div>
    </nav>
  </header>
</template>

<style scoped>
header {
  padding: 0.25rem;
}
</style>
