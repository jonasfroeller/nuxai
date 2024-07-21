import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app';

export default defineNuxtRouteMiddleware((to, _from) => {
  const { loggedIn } = useUserSession();

  if (!loggedIn.value) {
    // if (LOG_FRONTEND) console.info("Page is protected: not logged in");
    return navigateTo('/login');
  }
});
