// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },

  routeRules: {
    '/api/**': {
      cors: true
    }
  },

  nitro: {
    imports: {
      dirs: ['./server/utils']
    },
    /* storage: {
      redis: {
        driver: 'redis',
        url: process.env.KV_CONNECTION_STRING
      }
    } */
  },

  runtimeConfig: {
    huggingfaceApiKey: process.env.HUGGING_FACE_API_KEY,
    posthog: {
      apiKey: process.env.POSTHOG_API_KEY,
      apiHost: process.env.POSTHOG_API_HOST,
      isActive: process.env.POSTHOG_ACTIVE
    },
    sessionPassword: process.env.NUXT_SESSION_PASSWORD,
    cryptoSecret: process.env.CRYPTO_SECRET,
    databaseConnectionString: process.env.DATABASE_CONNECTION_STRING,
    oauth: {
      github: {
        clientId: process.env.NUXT_OAUTH_GITHUB_CLIENT_ID,
        clientSecret: process.env.NUXT_OAUTH_GITHUB_CLIENT_SECRET
      },
      google: {
        clientId: process.env.NUXT_OAUTH_GOOGLE_CLIENT_ID,
        clientSecret: process.env.NUXT_OAUTH_GOOGLE_CLIENT_SECRET
      }
    },
    session: { /* session persists for 7 days */
      name: 'nuxai-session',
      password: process.env.NUXT_SESSION_PASSWORD,
      cookie: {
        sameSite: 'lax'
      }
    }
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      meta: [
        { name: "description", content: "%s - Nuxt Chat App" }
      ]
    },
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

  modules: [
    "@nuxt/eslint",
    "@nuxtjs/tailwindcss",
    "shadcn-nuxt",
    "@nuxtjs/color-mode",
    "nuxt-posthog",
    '@pinia/nuxt',
    "nuxt-auth-utils",
    "@nuxtjs/mdc",
    "@nuxt/image",
    '@vueuse/nuxt'
  ],

  mdc: {
    /* remarkPlugins: {
      plugins: {
        // Register/Configure remark plugin to extend the parser
      }
    },*/
    /* rehypePlugins: {
      // "rehype-remark": {} // TODO: find out how to register a plugin here
       options: {
        // Configure rehype options to extend the parser
      },
      plugins: {
        // Register/Configure rehype plugin to extend the parser
      }
    }, */
    highlight: {
      highlighter: "shiki",
      theme: "github-dark",
      langs: ['js', 'jsx', 'json', 'toml', 'ts', 'tsx', 'vue', 'vue-html', 'svelte', 'css', 'html', 'xml', 'bash', 'shell', 'shellscript', 'bat', 'batch', 'cmd', 'powershell', 'md', 'mdc', 'yaml', 'yml', 'python', 'py', 'asciidoc', 'c', 'c#', 'cs', 'csharp', 'c++', 'dart', 'objective-c', 'objective-cpp', 'swift', 'docker', 'dockerfile', 'git-commit', 'git-rebase', 'go', 'java', 'kotlin', 'gql', 'http', 'json', 'latex', 'lua', 'sass', 'less', 'markdown', 'makefile', 'md', 'mdx', 'mdc', 'nginx', 'nix', 'php', 'scheme', 'plsql', 'sql', 'postcss', 'prisma', 'rust', 'rs', 'csv']
    }
  },

  pinia: {
    storesDirs: ['./stores/**'],
  },

  css: ['~/assets/css/app.css'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  colorMode: {
    classSuffix: ''
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
  },

  posthog: { /* https://nuxt-posthog.cmitjans.dev/configuration */
    publicKey: process.env.POSTHOG_API_KEY,
    host: process.env.POSTHOG_HOST,
    capturePageViews: true,
    disabled: process.env.POSTHOG_ACTIVE === 'false' /* process.dev (deprecated), import.meta.dev (unusable in config file) (https://nuxt.com/docs/api/advanced/import-meta#runtime-app-properties) */
  },

  eslint: {
    config: {
      stylistic: {
        quotes: 'single',
        commaDangle: 'never'
      }
    }
  }
})
