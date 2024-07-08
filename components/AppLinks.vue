<script setup lang="ts">
defineProps({
  layout: String
})

const { loggedIn } = useUserSession()
const router = useRouter()
const routes = router.options.routes

const hiddenRoutesIfLoggedIn = ['/login', '/sign-up']
const hiddenRoutesIfLoggedOut = ['/']

const visibleRoutes = computed(() => {
  if (loggedIn.value) {
    return routes.filter(route => !hiddenRoutesIfLoggedIn.includes(route.path))
  } else {
    return routes.filter(route => !hiddenRoutesIfLoggedOut.includes(route.path))
  }
})
</script>

<template>
  <div>
    <ul v-bind:class="{ 'chips': layout === 'chips' }">
      <NuxtLink v-for="route in visibleRoutes" :to="route.path" :key="route.path">
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

ul a:hover {
  text-decoration: underline;
}

ul.chips a {
  color: hsl(var(--primary-foreground) / 0.9);
  text-decoration: none;
  background-color: hsl(var(--primary) / 0.9);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}
</style>
