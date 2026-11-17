import React from "react";
import { Box, Typography } from "@mui/material";
import useCountUp from "../hooks/useCountUp";
import { Eyebrow, rise } from "./ui";
import { DISPLAY } from "../theme/themes";

export default function StatCard({ label, value, hint, i = 0 }) {
  const counted = useCountUp(typeof value === "number" ? value : 0);
  const shown = typeof value === "number" ? counted.toLocaleString() : value;
  return (
    <Box {...rise(i)} sx={{ p: { xs: 2, md: 3 }, minWidth: 0, bgcolor: "background.default" }}>
      <Eyebrow>{label}</Eyebrow>
      <Typography sx={{ fontFamily: DISPLAY, fontSize: { xs: 46, md: 68 }, lineHeight: 1, mt: 1, fontVariantNumeric: "tabular-nums" }}>{shown}</Typography>
      {hint && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{hint}</Typography>}
    </Box>
  );
}
