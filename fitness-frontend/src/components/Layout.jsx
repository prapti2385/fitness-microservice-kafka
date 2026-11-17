import React from "react";
import { NavLink } from "react-router-dom";
import { Box, Button, Typography } from "@mui/material";
import ThemePicker from "./ThemePicker";
import { Brand } from "./ui";
import { MONO } from "../theme/themes";

const links = [["Dashboard", "/dashboard"], ["Activities", "/activities"]];

export default function Layout({ name, onLogout, children }) {
  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Box component="header" sx={{ borderBottom: 1, borderColor: "divider", position: "sticky", top: 0, zIndex: 10, bgcolor: "background.default" }}>
        <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, md: 4 }, height: 64, display: "flex", alignItems: "center", gap: { xs: 2, md: 5 } }}>
          <Brand />
          <Box component="nav" aria-label="Main" sx={{ display: "flex", gap: { xs: 2, md: 4 }, flexGrow: 1 }}>
            {links.map(([label, to]) => (
              <NavLink key={to} to={to} className={({ isActive }) => `navlink${isActive ? " active" : ""}`}>{label}</NavLink>
            ))}
          </Box>
          <ThemePicker />
          <Typography sx={{ display: { xs: "none", md: "block" }, fontFamily: MONO, fontSize: 12, color: "text.secondary" }}>{name}</Typography>
          <Button size="small" color="inherit" onClick={onLogout} sx={{ fontFamily: MONO, fontSize: 12, letterSpacing: ".1em", textTransform: "uppercase" }}>Log out</Button>
        </Box>
      </Box>
      <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, md: 4 }, py: { xs: 4, md: 7 } }}>{children}</Box>
    </Box>
  );
}
