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

  modules: ["@nuxt/eslint", "@nuxtjs/tailwindcss", "shadcn-nuxt"],

  css: ['~/assets/css/tailwind.css'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: 'shadcn',
    /**
     * Directory that the component lives in.
     * @default "./components/ui"
     */
    componentDir: './components/ui'
  }
})