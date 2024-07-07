<script setup lang="ts">
  defineProps({
    layout: String
  })

  const router = useRouter()
  const routes = router.options.routes
</script>

<template>
  <div>
    <ul v-bind:class="{'chips': layout === 'chips'}">
      <NuxtLink v-for="route in routes" :to="route.path">
        <li :key="route.path">{{ route.name }}</li>
      </NuxtLink>
    </ul>
  </div>
</template>

<style scoped>
  ul {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    list-style: none;
    gap: 0.5rem;
  }

  ul.chips a {
    color: white;
    text-decoration: none;
    background-color: black;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
  }
</style>
