<template>
  <span class="ml-[0.125rem]">
    <span v-if="currentDot >= 1">.</span>
    <span v-if="currentDot >= 2">.</span>
    <span v-if="currentDot >= 3">.</span>
  </span>
</template>

<script setup>
const currentDot = ref(1);
let interval;

const updateDots = () => {
  currentDot.value = (currentDot.value % 3) + 1;
};

onMounted(() => {
  interval = setInterval(updateDots, 500); // Adjust the interval as needed
});

onUnmounted(() => {
  clearInterval(interval);
});
</script>

<style scoped></style>
