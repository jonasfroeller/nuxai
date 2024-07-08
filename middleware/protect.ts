import { defineNuxtRouteMiddleware, navigateTo } from "nuxt/app"

export default defineNuxtRouteMiddleware((to, _from) => {
    const { loggedIn } = useUserSession()

    if (!loggedIn.value) {
        console.log("not logged in");
        return navigateTo('/login')
    }
})
