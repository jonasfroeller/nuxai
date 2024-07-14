<script setup lang="ts">
import type { NuxtError } from '#app'
import Button from './components/ui/button/Button.vue';

const props = defineProps({
  error: Object as () => NuxtError
})

const handleError = () => clearError({ redirect: '/' })

const error_layout = 'error'
</script>

<template #error="{ error }">
  <NuxtLayout :name="error_layout">
    <h1 class="font-bold text-9xl text-primary-foreground">{{ error?.statusCode }}</h1>
    <p class="text-4xl font-medium text-primary-foreground">{{ error?.message }}</p>
    <Button class="mt-4" variant="secondary" @click="handleError">Home</Button>
  </NuxtLayout>
</template>
