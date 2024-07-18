<script lang="ts" setup>
    import { Search } from 'lucide-vue-next';
    import Input from './ui/input/Input.vue';
</script>

<template>
  <div class="h-full p-2 border rounded-md">
    <div class="relative items-center w-full">
        <Input id="search" type="text" placeholder="Search..." class="pl-10" />
        <span class="absolute inset-y-0 flex items-center justify-center px-2 start-0">
            <Search class="size-6 text-muted-foreground" />
        </span>
    </div>
  
    list of all chats
  </div>
</template>

<style scoped></style>
