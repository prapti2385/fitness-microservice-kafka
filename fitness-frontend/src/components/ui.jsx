import React from "react";
import { Box, Typography } from "@mui/material";
import { DISPLAY, MONO } from "../theme/themes";

// Spread onto an element to get the staggered entrance animation: <Box {...rise(2)} />
export const rise = (i = 0) => ({ className: "rise", style: { "--i": i } });

export const Eyebrow = ({ children, sx }) => (
  <Typography component="span"
    sx={{ fontFamily: MONO, fontSize: 11.5, letterSpacing: ".14em", textTransform: "uppercase", color: "text.secondary", ...sx }}>
    {children}
  </Typography>
);

export const Brand = () => (
  <Typography sx={{ fontFamily: DISPLAY, fontSize: 30, fontStyle: "italic", lineHeight: 1 }}>
    Pulse<Box component="span" sx={{ color: "primary.main" }}>.</Box>
  </Typography>
);

export const SectionTitle = ({ title, note, action }) => (
  <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", borderBottom: 1, borderColor: "divider", pb: 1.5, mb: 2 }}>
    <Box sx={{ display: "flex", alignItems: "baseline", gap: 2 }}>
      <Typography sx={{ fontFamily: DISPLAY, fontSize: 34, lineHeight: 1 }}>{title}</Typography>
      {note && <Eyebrow>{note}</Eyebrow>}
    </Box>
    {action}
  </Box>
);
