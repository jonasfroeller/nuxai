<script setup lang="ts">
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu } from 'lucide-vue-next';

defineProps({
  layout: String,
});

const { loggedIn } = useUserSession();
const router = useRouter();
const routes = router.options.routes;

const hiddenRoutes = ['/new-password'];
const hiddenRoutesIfLoggedIn = hiddenRoutes.concat(['/log-in', '/sign-up']);
const hiddenRoutesIfLoggedOut = hiddenRoutes.concat(['/', '/account']);

const visibleRoutes = computed(() => {
  if (loggedIn.value) {
    return routes.filter(
      (route) => !hiddenRoutesIfLoggedIn.includes(route.path)
    );
  } else {
    return routes.filter(
      (route) => !hiddenRoutesIfLoggedOut.includes(route.path)
    );
  }
});

const { width: windowWidth } = useWindowSize();
</script>

<template>
  <div class="flex justify-center">
    <div v-if="windowWidth <= 700 && layout === 'navigation'">
      <DropdownMenu>
        <DropdownMenuTrigger><Menu /></DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem v-for="route in visibleRoutes" :key="route.path">
            <NuxtLink :to="route.path" activeClass="underline">
              <p :key="route.path">{{ route.name }}</p>
            </NuxtLink>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    <ul
      v-bind:class="{ navigation: layout === 'navigation' }"
      v-if="windowWidth > 700 || layout !== 'navigation'"
    >
      <NuxtLink
        v-for="route in visibleRoutes"
        :to="route.path"
        :key="route.path"
        activeClass="active-link"
      >
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

ul.navigation a {
  text-decoration: none;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

ul.navigation a.active-link {
  text-decoration: underline;
}
</style>
