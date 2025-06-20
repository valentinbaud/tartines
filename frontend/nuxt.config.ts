import { defineNuxtConfig } from "nuxt/config";
import commonjs from "vite-plugin-commonjs";

const AUTH_TOKEN = "mealie.auth.token";

export default defineNuxtConfig({
  // Global page headers: https://go.nuxtjs.dev/config-head
  // target: "static",

  modules: [
    "@vite-pwa/nuxt",
    "@nuxtjs/i18n",
    "@sidebase/nuxt-auth",
    "@nuxtjs/google-fonts",
    "vuetify-nuxt-module",
    "@nuxtjs/mdc",
    "@nuxt/eslint",
  ],
  ssr: false,

  components: [
    {
      path: "~/components",
      pathPrefix: false,
    },
  ],
  devtools: {
    enabled: false,
  },
  app: {
    baseURL: process.env.SUB_PATH || "",

    head: {
      title: "Mealie",
      meta: [
        { property: "og:type", content: "website" },
        { property: "og:title", content: "Mealie" },
        { property: "og:site_name", content: "Mealie" },
        {
          property: "og:description",
          content: "Mealie is a recipe management app for your kitchen.",
        },
        {
          property: "og:image",
          content:
            "https://raw.githubusercontent.com/mealie-recipes/mealie/9571816ac4eed5beacfc0abf6c03eff1427fd0eb/frontend/static/icons/android-chrome-512x512.png",
        },
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content: "Mealie is a recipe management app for your kitchen.",
        },
      ],
      link: [
        { "rel": "icon", "type": "image/x-icon", "href": "/favicon.ico", "data-n-head": "ssr" },
        { "rel": "shortcut icon", "type": "image/png", "href": "/icons/icon-x64.png", "data-n-head": "ssr" },
        { "rel": "apple-touch-icon", "type": "image/png", "href": "/icons/apple-touch-icon.png", "data-n-head": "ssr" },
        { "rel": "mask-icon", "href": "/icons/safari-pinned-tab.svg", "data-n-head": "ssr" },
      ],
    },

    /* viewTransition: {
      name: "layout",
      mode: "out-in",
    }, */
    viewTransition: true,
  },

  css: ["~/assets/css/main.css", "~/assets/css/fonts.css", "~/assets/style-overrides.scss"],

  runtimeConfig: {
    sessionPassword: process.env.SESSION_PASSWORD || "password-with-at-least-32-characters",
    apiUrl: process.env.API_URL || "http://localhost:9000",
    public: {
      AUTH_TOKEN,
      GLOBAL_MIDDLEWARE: process.env.GLOBAL_MIDDLEWARE || undefined,
      SUB_PATH: process.env.SUB_PATH || "",
      // ==============================================
      // Theme Runtime Config
      useDark: Boolean(process.env.THEME_USE_DARK) || false,
      themes: {
        dark: {
          primary: process.env.THEME_DARK_PRIMARY || "#E58325",
          accent: process.env.THEME_DARK_ACCENT || "#007A99",
          secondary: process.env.THEME_DARK_SECONDARY || "#973542",
          success: process.env.THEME_DARK_SUCCESS || "#43A047",
          info: process.env.THEME_DARK_INFO || "#1976d2",
          warning: process.env.THEME_DARK_WARNING || "#FF6D00",
          error: process.env.THEME_DARK_ERROR || "#EF5350",
          background: "#1E1E1E",
        },
        light: {
          primary: process.env.THEME_LIGHT_PRIMARY || "#E58325",
          accent: process.env.THEME_LIGHT_ACCENT || "#007A99",
          secondary: process.env.THEME_DARK_SECONDARY || "#973542",
          success: process.env.THEME_DARK_SUCCESS || "#43A047",
          info: process.env.THEME_LIGHT_INFO || "#1976d2",
          warning: process.env.THEME_LIGHT_WARNING || "#FF6D00",
          error: process.env.THEME_LIGHT_ERROR || "#EF5350",
        },
      },
    },
  },
  dir: {
    static: "static",
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    // https://nuxtjs.org/docs/2.x/configuration-glossary/configuration-build
    analyze: false,
    /* babel: {
      plugins: [
        ["@babel/plugin-proposal-private-property-in-object", { loose: true }],
      ],
    }, */
    transpile: process.env.NODE_ENV !== "production" ? [/@vue[\\/]composition-api/] : [],
  },
  future: {
    compatibilityVersion: 3,
  },

  compatibilityDate: "2025-03-28",

  nitro: {
    baseURL: process.env.SUB_PATH || "",
  },

  vite: {
    plugins: [
      commonjs(),
    ],
  },

  auth: {
    isEnabled: true,
    // disableServerSideAuth: true,
    originEnvKey: "AUTH_ORIGIN",
    baseURL: "/api",
    provider: {
      type: "local",
      endpoints: {
        signIn: { path: "/auth/token", method: "post" },
        signOut: { path: "/auth/logout", method: "post" },
        getSession: { path: "/users/self", method: "get" },
      },
      token: {
        signInResponseTokenPointer: "/access_token",
        type: "Bearer",
        cookieName: AUTH_TOKEN,
        maxAgeInSeconds: 604800, // 7 days
      },
      pages: {
        login: "/login",
      },
    },
  },

  // eslint rules
  eslint: {
    config: {
      formatters: true,
      stylistic: {
        indent: 2,
        semi: true,
        quotes: "double",
        commaDangle: "always-multiline",
      },
    },
  },

  googleFonts: {
    fontsPath: "/assets/fonts",
    download: false, // Disable automatic downloading
    families: {
      Roboto: [100, 300, 400, 500, 700, 900],
    },
  },
  /* auth: {
    redirect: {
      login: "/login",
      logout: "/login",
      callback: "/login",
      home: "/",
    },
    cookie: {
      prefix: "mealie.auth.",
      options: {
        expires: 7,
        path: "/",
      },
    },
    rewriteRedirects: false,
    // Options
    strategies: {
      local: {
        resetOnError: true,
        token: {
          property: "access_token",
          global: true,
          // required: true,
          // type: 'Bearer'
        },
        user: {
          property: "",
          autoFetch: true,
        },
        endpoints: {
          login: {
            url: "api/auth/token",
            method: "post",
            propertyName: "access_token",
          },
          refresh: { url: "api/auth/refresh", method: "post" },
          logout: { url: "api/auth/logout", method: "post" },
          user: { url: "api/users/self", method: "get" },
        },
      },
      oidc: {
        scheme: "local",
        resetOnError: true,
        token: {
          property: "access_token",
          global: true,
        },
        user: {
          property: "",
          autoFetch: true,
        },
        endpoints: {
          login: {
            url: "api/auth/oauth/callback",
            method: "get",
          },
          logout: { url: "api/auth/logout", method: "post" },
          user: { url: "api/users/self", method: "get" },
        },
      },
    },
  }, */

  i18n: {
    locales: [
      // CODE_GEN_ID: MESSAGE_LOCALES
      { code: "lv-LV", file: "lv-LV.ts" },
      { code: "el-GR", file: "el-GR.ts" },
      { code: "it-IT", file: "it-IT.ts" },
      { code: "ko-KR", file: "ko-KR.ts" },
      { code: "es-ES", file: "es-ES.ts" },
      { code: "ja-JP", file: "ja-JP.ts" },
      { code: "bg-BG", file: "bg-BG.ts" },
      { code: "zh-CN", file: "zh-CN.ts" },
      { code: "tr-TR", file: "tr-TR.ts" },
      { code: "ar-SA", file: "ar-SA.ts" },
      { code: "hu-HU", file: "hu-HU.ts" },
      { code: "pt-PT", file: "pt-PT.ts" },
      { code: "no-NO", file: "no-NO.ts" },
      { code: "sv-SE", file: "sv-SE.ts" },
      { code: "ro-RO", file: "ro-RO.ts" },
      { code: "sk-SK", file: "sk-SK.ts" },
      { code: "uk-UA", file: "uk-UA.ts" },
      { code: "lt-LT", file: "lt-LT.ts" },
      { code: "fr-CA", file: "fr-CA.ts" },
      { code: "pl-PL", file: "pl-PL.ts" },
      { code: "hr-HR", file: "hr-HR.ts" },
      { code: "da-DK", file: "da-DK.ts" },
      { code: "pt-BR", file: "pt-BR.ts" },
      { code: "de-DE", file: "de-DE.ts" },
      { code: "ca-ES", file: "ca-ES.ts" },
      { code: "sr-SP", file: "sr-SP.ts" },
      { code: "cs-CZ", file: "cs-CZ.ts" },
      { code: "gl-ES", file: "gl-ES.ts" },
      { code: "fr-FR", file: "fr-FR.ts" },
      { code: "fr-BE", file: "fr-BE.ts" },
      { code: "zh-TW", file: "zh-TW.ts" },
      { code: "af-ZA", file: "af-ZA.ts" },
      { code: "is-IS", file: "is-IS.ts" },
      { code: "sl-SI", file: "sl-SI.ts" },
      { code: "ru-RU", file: "ru-RU.ts" },
      { code: "he-IL", file: "he-IL.ts" },
      { code: "nl-NL", file: "nl-NL.ts" },
      { code: "en-US", file: "en-US.ts" },
      { code: "en-GB", file: "en-GB.ts" },
      { code: "fi-FI", file: "fi-FI.ts" },
      { code: "vi-VN", file: "vi-VN.ts" },
      // END: MESSAGE_LOCALES
    ],
    strategy: "no_prefix",
    lazy: true,
    types: "composition",
    langDir: "./../lang/locales", // note: we need to up one ../ because the default root of lang dir is the /frontend/i18n, which can not be configured
    defaultLocale: "en-US",
    detectBrowserLanguage: {
      useCookie: true,
      alwaysRedirect: true,
      fallbackLocale: "en-US",
    },
    compilation: {
      strictMessage: false,
      escapeHtml: true,
    },
    vueI18n: "./../i18n.config.ts", // note: we need to up one ../ because the default root of lang dir is the /frontend/i18n, which can not be configured
  },

  // PWA module configuration: https://go.nuxtjs.dev/pwa
  pwa: {
    mode: process.env.NODE_ENV === "production" ? "production" : "development",
    registerType: "autoUpdate",
    useCredentials: true,
    manifest: {
      start_url: "/",
      scope: "/",
      lang: "en",
      name: "Mealie",
      short_name: "Mealie",
      id: "mealie",
      description: "Mealie is a recipe management and meal planning app",
      theme_color: process.env.THEME_LIGHT_PRIMARY || "#E58325",
      background_color: "#FFFFFF",
      display: "standalone",
      display_override: [
        "standalone",
        "minimal-ui",
        "browser",
        "window-controls-overlay",
      ],
      share_target: {
        action: "/r/create/url",
        method: "GET",
        params: {
          /* title and url are not currently used in Mealie. If there are issues
              with sharing, uncommenting those lines might help solve the puzzle. */
          // "title": "title",
          text: "recipe_import_url",
          // "url": "url",
        },
      },
      icons: [
        {
          src: "/icons/android-chrome-192x192.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "any",
        },
        {
          src: "/icons/android-chrome-512x512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any",
        },
        {
          src: "/icons/android-chrome-maskable-192x192.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "maskable",
        },
        {
          src: "/icons/android-chrome-maskable-512x512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable",
        },
      ],
      screenshots: [
        {
          src: "/screenshots/home-narrow.png",
          sizes: "1600x2420",
          form_factor: "narrow",
          label: "Home Page",
        },
        {
          src: "/screenshots/recipe-narrow.png",
          sizes: "1600x2420",
          form_factor: "narrow",
          label: "Recipe Page",
        },
        {
          src: "/screenshots/editor-narrow.png",
          sizes: "1600x2420",
          form_factor: "narrow",
          label: "Editor Page",
        },
        {
          src: "/screenshots/parser-narrow.png",
          sizes: "1600x2420",
          form_factor: "narrow",
          label: "Parser Page",
        },
        {
          src: "/screenshots/home-wide.png",
          sizes: "2560x1460",
          form_factor: "wide",
          label: "Home Page",
        },
        {
          src: "/screenshots/recipe-wide.png",
          sizes: "2560x1460",
          form_factor: "wide",
          label: "Recipe Page",
        },
        {
          src: "/screenshots/editor-wide.png",
          sizes: "2560x1460",
          form_factor: "wide",
          label: "Editor Page",
        },
        {
          src: "/screenshots/parser-wide.png",
          sizes: "2560x1460",
          form_factor: "wide",
          label: "Parser Page",
        },
      ],
      shortcuts: [
        {
          name: "Shopping Lists",
          short_name: "Shopping Lists",
          description: "Open the shopping lists",
          url: "/shopping-lists",
          icons: [
            {
              src: "/icons/mdiFormatListChecks-192x192.png",
              sizes: "192x192",
            },
            {
              src: "/icons/mdiFormatListChecks-96x96.png",
              sizes: "96x96",
            },
          ],
        },
        {
          name: "Meal Planner",
          short_name: "Meal Planner",
          description: "Open the meal planner",
          url: "/household/mealplan/planner/view",
          icons: [
            {
              src: "/icons/mdiCalendarMultiselect-192x192.png",
              sizes: "192x192",
            },
            {
              src: "/icons/mdiCalendarMultiselect-96x96.png",
              sizes: "96x96",
            },
          ],
        },
      ],
      prefer_related_applications: false,
      handle_links: "preferred",
      categories: [
        "food",
      ],
      launch_handler: {
        client_mode: ["focus-existing", "auto"],
      },
      edge_side_panel: {
        preferred_width: 400,
      },
    },
  },

  // Vuetify module configuration: https://go.nuxtjs.dev/config-vuetify
  vuetify: {
    moduleOptions: {},
    vuetifyOptions: {
      icons: {
        defaultSet: "mdi-svg",
      },
      // Theme Config set at runtime by /plugins/theme.ts
      // This config doesn't do anything.
      theme: {},
      locale: {
        locale: "en-US",
        fallback: "en-US",
      },
    },
  },
});
