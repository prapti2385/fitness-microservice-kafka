import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: { main: "#0E9F6E", dark: "#057A55", light: "#DEF7EC", contrastText: "#fff" },
    background: { default: "#F5F7FA", paper: "#FFFFFF" },
    text: { primary: "#111827", secondary: "#6B7280" },
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: '"Inter","Segoe UI",Roboto,system-ui,sans-serif',
    h3: { fontWeight: 800, letterSpacing: "-0.03em" },
    h4: { fontWeight: 700, letterSpacing: "-0.02em" },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiCard: { defaultProps: { elevation: 0 }, styleOverrides: { root: { border: "1px solid #E5E7EB" } } },
    MuiButton: { defaultProps: { disableElevation: true }, styleOverrides: { root: { borderRadius: 10 } } },
  },
});
