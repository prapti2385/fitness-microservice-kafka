import React from "react";
import { Box, Button, Typography } from "@mui/material";
import ThemePicker from "./ThemePicker";
import { Brand, Eyebrow, rise } from "./ui";
import { DISPLAY } from "../theme/themes";

export default function LoginPage({ onLogin }) {
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: { xs: 2, md: 4 }, height: 64, borderBottom: 1, borderColor: "divider" }}>
        <Brand />
        <ThemePicker />
      </Box>
      <Box sx={{ flex: 1, display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.5fr 1fr" } }}>
        <Box sx={{ p: { xs: 3, md: 8 }, display: "flex", flexDirection: "column", justifyContent: "center", borderRight: { md: 1 }, borderColor: "divider" }}>
          <Box {...rise(0)}><Eyebrow>Training log · AI coach</Eyebrow></Box>
          <Typography component="h1" {...rise(1)}
            sx={{ fontFamily: DISPLAY, fontSize: { xs: 60, md: 112 }, lineHeight: 0.92, letterSpacing: "-0.035em", my: 3 }}>
            Every rep,<br /><em>on the record.</em>
          </Typography>
          <Typography {...rise(2)} sx={{ maxWidth: 460, color: "text.secondary", fontSize: 18 }}>
            Log your workouts, watch the numbers move, and get coaching built from what you actually did.
          </Typography>
        </Box>
        <Box sx={{ p: { xs: 3, md: 8 }, display: "flex", alignItems: "center" }}>
          <Box {...rise(3)} sx={{ width: "100%" }}>
            <Typography sx={{ fontFamily: DISPLAY, fontSize: 44, lineHeight: 1, mb: 1.5 }}>Sign in</Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>Secure single sign-on. You’ll come straight back here.</Typography>
            <Button fullWidth size="large" variant="contained" onClick={onLogin}>Continue →</Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
