import type { Theme } from "@fluentui/react-components";

import {
  DEFAULT_THEME_PREFERENCE,
  DEFAULT_PRIMARY_COLOR,
  LOCAL_STORAGE_PRIMARY_COLOR_KEY,
  LOCAL_STORAGE_THEME_PREFERENCE_KEY,
  LOCAL_STORAGE_CACHED_THEME_KEY,
} from "./themeConstants";
import type { ThemePreference, InitialValues } from "./ThemeProvider.types";

export const getInitialValues = (): InitialValues => {
  let preference: ThemePreference = DEFAULT_THEME_PREFERENCE;
  let color: string = DEFAULT_PRIMARY_COLOR;
  let cachedThemeString: string | null = null;

  if (typeof window !== "undefined") {
    try {
      const storedPreference = localStorage.getItem(
        LOCAL_STORAGE_THEME_PREFERENCE_KEY,
      );
      if (
        storedPreference === "light" ||
        storedPreference === "dark" ||
        storedPreference === "system"
      ) {
        preference = storedPreference;
      }
      const storedColor = localStorage.getItem(LOCAL_STORAGE_PRIMARY_COLOR_KEY);
      if (storedColor) {
        color = storedColor;
      }
      cachedThemeString = localStorage.getItem(LOCAL_STORAGE_CACHED_THEME_KEY);
    } catch (error) {
      console.error(
        "Failed to read initial theme values from localStorage:",
        error,
      );
      cachedThemeString = null;
    }
  }
  return { preference, color, cachedThemeString };
};

export const persistThemeData = (theme: Theme, preference: ThemePreference) => {
  if (typeof window !== "undefined") {
    try {
      const primaryColor = theme.colorBrandBackground || DEFAULT_PRIMARY_COLOR;
      localStorage.setItem(
        LOCAL_STORAGE_CACHED_THEME_KEY,
        JSON.stringify(theme),
      );
      localStorage.setItem(LOCAL_STORAGE_THEME_PREFERENCE_KEY, preference);
      localStorage.setItem(LOCAL_STORAGE_PRIMARY_COLOR_KEY, primaryColor);
    } catch (error) {
      console.error(`Failed to write theme data to localStorage:`, error);
    }
  }
};
