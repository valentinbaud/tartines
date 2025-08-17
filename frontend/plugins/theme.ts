export interface ThemeConfig {
  lightPrimary: string;
  lightAccent: string;
  lightSecondary: string;
  lightSuccess: string;
  lightInfo: string;
  lightWarning: string;
  lightError: string;
  darkPrimary: string;
  darkAccent: string;
  darkSecondary: string;
  darkSuccess: string;
  darkInfo: string;
  darkWarning: string;
  darkError: string;
}

let __cachedTheme: ThemeConfig | undefined;

async function fetchTheme(): Promise<ThemeConfig | undefined> {
  const route = "/api/app/about/theme";

  try {
    const response = await fetch(route);
    const data = await response.json();
    return data as ThemeConfig;
  }
  catch {
    return undefined;
  }
}

export default defineNuxtPlugin(async (nuxtApp) => {
  nuxtApp.hook("vuetify:before-create", async ({ vuetifyOptions }) => {
    let theme = __cachedTheme;
    if (!theme) {
      theme = await fetchTheme();
      __cachedTheme = theme;
    }
    vuetifyOptions.theme = {
      defaultTheme: nuxtApp.$config.public.useDark ? "dark" : "light",
      variations: {
        colors: ["primary", "accent", "secondary", "success", "info", "warning", "error", "background"],
        lighten: 3,
        darken: 3,
      },
      themes: {
        dark: {
          dark: true,
          colors: {
            primary: theme?.lightPrimary ?? "#E85C60",
            accent: theme?.lightAccent ?? "#D9A74A",
            secondary: theme?.lightSecondary ?? "#F6ADAB",
            success: theme?.lightSuccess ?? "#A3CEA2",
            info: theme?.lightInfo ?? "#304F65",
            warning: theme?.lightWarning ?? "#C68A2C",
            error: theme?.lightError ?? "#D22C39",
            background: "#1E1E1E",
          },
        },
        light: {
          dark: false,
          colors: {
            primary: theme?.darkPrimary ?? "#E85C60",
            accent: theme?.darkAccent ?? "#D9A74A",
            secondary: theme?.darkSecondary ?? "#FACFCE",
            success: theme?.darkSuccess ?? "#A3CEA2",
            info: theme?.darkInfo ?? "#72A2BE",
            warning: theme?.darkWarning ?? "#ECD69C",
            error: theme?.darkError ?? "#F07C7C",
          },
        },
      },
    };
  });
});
