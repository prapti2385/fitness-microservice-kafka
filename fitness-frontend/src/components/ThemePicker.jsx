import React, { useState } from "react";
import { Box, ButtonBase, Popover, Typography } from "@mui/material";
import { MONO, THEMES } from "../theme/themes";
import { useAppTheme } from "../theme/ThemeProvider";
import { Eyebrow } from "./ui";

const Swatch = ({ t }) => (
  <Box sx={{ width: 22, height: 22, flexShrink: 0, border: `1px solid ${t.ink}`,
    background: `linear-gradient(135deg, ${t.bg} 0 50%, ${t.accent} 50% 100%)` }} />
);

export default function ThemePicker() {
  const { themeKey, setThemeKey } = useAppTheme();
  const [anchor, setAnchor] = useState(null);
  const current = THEMES[themeKey];

  return (
    <>
      <ButtonBase onClick={(e) => setAnchor(e.currentTarget)} aria-label="Change theme"
        sx={{ display: "flex", gap: 1.25, px: 1.25, py: 0.75, border: 1, borderColor: "divider", fontFamily: MONO, fontSize: 12, letterSpacing: ".08em", textTransform: "uppercase" }}>
        <Swatch t={current} /> {current.name}
      </ButtonBase>
      <Popover open={Boolean(anchor)} anchorEl={anchor} onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }} transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{ paper: { sx: { mt: 1, p: 1.5, width: 240, border: 1, borderColor: "divider" } } }}>
        <Eyebrow>Theme</Eyebrow>
        <Box sx={{ mt: 1, display: "grid", gap: 0.5 }}>
          {Object.entries(THEMES).map(([key, t]) => (
            <ButtonBase key={key} aria-pressed={key === themeKey} onClick={() => { setThemeKey(key); setAnchor(null); }}
              sx={{ display: "flex", justifyContent: "flex-start", gap: 1.5, p: 1, border: 1, borderColor: key === themeKey ? "primary.main" : "transparent", "&:hover": { bgcolor: "action.hover" } }}>
              <Swatch t={t} />
              <Typography sx={{ fontWeight: 600 }}>{t.name}</Typography>
              <Typography sx={{ ml: "auto", fontFamily: MONO, fontSize: 11, color: "text.secondary" }}>{t.mode}</Typography>
            </ButtonBase>
          ))}
        </Box>
      </Popover>
    </>
  );
}
