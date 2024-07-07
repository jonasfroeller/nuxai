// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },

  app: {
    pageTransition: {
      name: 'page',
      mode: 'out-in' // default
    },
    layoutTransition: {
      name: 'layout',
      mode: 'out-in' // default
    }
  },

  router: {
    options: {
      scrollBehaviorType: 'smooth'
    }
  },

  typescript: {
    typeCheck: true
  },

  modules: ["@nuxt/eslint"]
})