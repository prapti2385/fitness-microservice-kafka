import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { THEMES, buildTheme } from "./themes";

const Ctx = createContext({ themeKey: "paper", setThemeKey: () => {} });
export const useAppTheme = () => useContext(Ctx);

const STORAGE_KEY = "fit-theme";
const initial = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && THEMES[saved]) return saved;
  } catch { /* storage unavailable */ }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "midnight" : "paper";
};

export default function AppThemeProvider({ children }) {
  const [themeKey, setThemeKey] = useState(initial);
  const theme = useMemo(() => buildTheme(themeKey), [themeKey]);

  useEffect(() => {
    const t = THEMES[themeKey];
    const root = document.documentElement;
    root.dataset.theme = themeKey;
    root.style.colorScheme = t.mode;
    ["bg", "surface", "ink", "muted", "accent"].forEach((k) => root.style.setProperty(`--${k}`, t[k]));
    try { localStorage.setItem(STORAGE_KEY, themeKey); } catch { /* ignore */ }
  }, [themeKey]);

  return (
    <Ctx.Provider value={{ themeKey, setThemeKey }}>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        {children}
      </ThemeProvider>
    </Ctx.Provider>
  );
}
