import { alpha, createTheme } from "@mui/material/styles";

export const DISPLAY = '"Instrument Serif","Iowan Old Style",Georgia,serif';
export const BODY = '"Hanken Grotesk","Segoe UI",system-ui,sans-serif';
export const MONO = '"DM Mono",ui-monospace,Consolas,monospace';

export const THEMES = {
  paper: { name: "Paper", mode: "light", bg: "#F3EFE6", surface: "#FBF9F4", ink: "#1C1B17", muted: "#6E6A5E", accent: "#D4421E" },
  midnight: { name: "Midnight", mode: "dark", bg: "#0F1115", surface: "#161922", ink: "#ECE9E1", muted: "#8B8F9A", accent: "#E8FF59" },
  clay: { name: "Clay", mode: "light", bg: "#E7D3BF", surface: "#F1E3D3", ink: "#2A1A12", muted: "#7A5C49", accent: "#A8321C" },
  forest: { name: "Forest", mode: "dark", bg: "#0E1A14", surface: "#13241B", ink: "#E4EBDD", muted: "#86A08F", accent: "#F2A33A" },
  mono: { name: "Mono", mode: "light", bg: "#FFFFFF", surface: "#FFFFFF", ink: "#000000", muted: "#555555", accent: "#0038FF" },
};

export function buildTheme(key) {
  const t = THEMES[key] ?? THEMES.paper;
  const line = alpha(t.ink, 0.22);
  const heading = { fontFamily: DISPLAY, fontWeight: 400, letterSpacing: "-0.01em" };
  return createTheme({
    palette: {
      mode: t.mode,
      primary: { main: t.accent, contrastText: t.mode === "dark" ? t.bg : "#fff" },
      background: { default: t.bg, paper: t.surface },
      text: { primary: t.ink, secondary: t.muted },
      divider: line,
    },
    shape: { borderRadius: 2 },
    typography: {
      fontFamily: BODY,
      h4: heading, h5: heading, h6: heading,
      button: { textTransform: "none", fontWeight: 600, letterSpacing: ".01em" },
    },
    components: {
      MuiPaper: { defaultProps: { elevation: 0 }, styleOverrides: { root: { backgroundImage: "none" } } },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: { root: { transition: "transform .15s ease, background-color .2s", "&:active": { transform: "translateY(1px)" } } },
      },
      MuiOutlinedInput: { styleOverrides: { notchedOutline: { borderColor: line } } },
    },
  });
}
