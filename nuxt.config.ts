// https://nuxt.com/docs/api/configuration/nuxt-config

import type { HTTPMethod } from 'nuxt-security';
import { protectedRoutes } from './utils/pages';
import { supportedShikiLanguages } from './utils/formatters';
// @ts-ignore
import removeConsole from 'vite-plugin-remove-console';

const corsHandler = {
  origin: '*',
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'] as HTTPMethod[],
  preflight: {
    statusCode: 204,
  },
};

export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: {
    enabled: false,
    componentInspector: false,
    timeline: {
      enabled: false,
    },
    vscode: {
      reuseExistingServer: true,
    },
  },

  devServer: {
    port: 42124,
  },

  /* site: {
    url: 'https://nuxai-chat.vercel.app', // OG customization: https://nuxtseo.com/og-image/getting-started/getting-familar-with-nuxt-og-image
  }, */

  robots: {
    disallow: protectedRoutes, // replace with https://nuxtseo.com/robots/guides/route-rules#inline-route-rules in the future
  },

  vite: {
    logLevel: 'warn', // 'info' | 'warn' | 'error' | 'silent'
    plugins: [removeConsole()],
  },

  routeRules: {
    '/api/**': {
      security: {
        corsHandler,
      },
    },
    '/auth/**': {
      security: {
        corsHandler,
      },
    },
  },

  // Posthog adds an inline script, which causes `Failed to load resource: net::ERR_BLOCKED_BY_RESPONSE.NotSameOriginAfterDefaultedToSameOriginByCoep`, using the recommended security configuration.
  // Docs, to allow it: https://nuxt-security.vercel.app/documentation/advanced/strict-csp#whitelisting-external-resources.
  // Keep in mind: Although valid from a CSP syntax perspective, allowing 'unsafe-inline' on script-src is unsafe. This setup is not a Script CSP
  security: {
    rateLimiter: false,
    headers: {
      crossOriginEmbedderPolicy:
        process.env.NODE_ENV === 'development' ? 'unsafe-none' : 'require-corp', // to allow devtools
    },
  },

  nitro: {
    imports: {
      dirs: ['./server/utils'],
    },
    experimental: {
      // Scalar support is currently available in nightly channel. (https://nitro.unjs.io/config#experimental, https://nuxt.com/modules/scalar)
      openAPI:
        true /* { // enables /_nitro/scalar and /_nitro/swagger and /_nitro/openapi.json (currently only in dev mode)
        meta: {
          title: 'Nuxai API Documentation',
          description: 'Chat with different AI models using this REST-API.',
          version: '0.0.0',
        }
      }, */,
    },
    /* storage: {
      redis: {
        driver: 'redis',
        url: process.env.KV_CONNECTION_STRING
      }
    } */
  },

  components: [
    {
      path: '~/components',
      pathPrefix: false, // disables components/base/Button.vue => <BaseButton /> for auto imports
    },
    // prefix needed, because pathPrefix: true doesn't work, when files are called `Index.vue` (the keyword index is thrown away completely, also for the component name)
    {
      path: '~/components/ai/chat',
      prefix: 'AiChat',
    },
    {
      path: '~/components/ai/chats',
      prefix: 'AiChats',
    },
  ],

  runtimeConfig: {
    huggingfaceApiKey: process.env.HUGGING_FACE_API_KEY,
    posthog: {
      apiKey: process.env.POSTHOG_API_KEY,
      apiHost: process.env.POSTHOG_API_HOST,
      isActive: process.env.POSTHOG_ACTIVE,
    },
    sessionPassword: process.env.NUXT_SESSION_PASSWORD,
    cryptoSecret: process.env.CRYPTO_SECRET,
    databaseConnectionString: process.env.DATABASE_CONNECTION_STRING,
    oauth: {
      github: {
        clientId: process.env.NUXT_OAUTH_GITHUB_CLIENT_ID,
        clientSecret: process.env.NUXT_OAUTH_GITHUB_CLIENT_SECRET,
      },
      google: {
        clientId: process.env.NUXT_OAUTH_GOOGLE_CLIENT_ID,
        clientSecret: process.env.NUXT_OAUTH_GOOGLE_CLIENT_SECRET,
      },
    },
    session: {
      /* session persists for 7 days */ name: 'nuxai-session',
      password: process.env.NUXT_SESSION_PASSWORD,
      cookie: {
        sameSite: 'lax',
      },
    },
    public: {
      IS_SERVERLESS: process.env.IS_SERVERLESS,
      LOG_SQL_QUERIES: process.env.LOG_SQL_QUERIES,
      LOG_BACKEND: process.env.LOG_BACKEND,
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      meta: [{ name: 'description', content: '%s - Nuxt Chat App' }],
    },
    pageTransition: {
      name: 'page',
      mode: 'out-in', // default
    },
    layoutTransition: {
      name: 'layout',
      mode: 'out-in', // default
    },
  },

  router: {
    options: {
      scrollBehaviorType: 'smooth',
    },
  },

  typescript: {
    typeCheck: false,
  },

  modules: [
    '@nuxt/eslint',
    '@nuxtjs/tailwindcss',
    'shadcn-nuxt',
    '@nuxtjs/color-mode',
    'nuxt-posthog',
    '@pinia/nuxt',
    'nuxt-auth-utils',
    '@nuxtjs/mdc',
    '@nuxt/image',
    '@vueuse/nuxt',
    'nuxt-time',
    'nuxt-security',
    // "nuxt-og-image"
    '@nuxtjs/robots',
    'nuxt-monaco-editor',
  ],

  mdc: {
    remarkPlugins: {
      'remark-flexible-code-titles': {},
    },
    /* rehypePlugins: {
      options: {
        // Configure rehype options to extend the parser
      },
      plugins: {
        // Register/Configure rehype plugin to extend the parser
      }
    }, */
    highlight: {
      highlighter: 'shiki',
      theme: {
        dark: 'github-dark',
        default: 'github-light',
      },
      langs: supportedShikiLanguages,
    },
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
    classSuffix: '',
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
    componentDir: './components/ui',
  },

  posthog: {
    /* https://nuxt-posthog.cmitjans.dev/configuration */
    publicKey: process.env.POSTHOG_API_KEY,
    host: process.env.POSTHOG_HOST,
    capturePageViews: true,
    disabled:
      process.env.POSTHOG_ACTIVE ===
      'false' /* process.dev (deprecated), import.meta.dev (unusable in config file) (https://nuxt.com/docs/api/advanced/import-meta#runtime-app-properties) */,
  },

  eslint: {
    config: {
      stylistic: {
        quotes: 'single',
        commaDangle: 'never',
      },
    },
  },
});
