import React, { useContext, useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Box, CircularProgress } from "@mui/material";
import { AuthContext } from "react-oauth2-code-pkce";
import { logout, setCredentials } from "./store/authSlice";
import Layout from "./components/Layout";
import LoginPage from "./components/LoginPage";
import ActivityDetail from "./components/ActivityDetail";
import DashboardPage from "./pages/DashboardPage";
import ActivitiesPage from "./pages/ActivitiesPage";

const AppContent = () => {
  const { token, tokenData, logIn, logOut } = useContext(AuthContext);
  const dispatch = useDispatch();
  const location = useLocation();
  const [authReady, setAuthReady] = useState(false);

  // Store the token before any page mounts, so its first API call is authenticated.
  useEffect(() => {
    if (token) {
      dispatch(setCredentials({ token, user: tokenData }));
      setAuthReady(true);
    } else {
      setAuthReady(false);
    }
  }, [token, tokenData, dispatch]);

  if (!token) return <LoginPage onLogin={() => logIn()} />;
  if (!authReady) {
    return <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}><CircularProgress /></Box>;
  }

  const name = tokenData?.given_name || tokenData?.name || tokenData?.preferred_username || "there";

  return (
    <Layout name={name} onLogout={() => { dispatch(logout()); logOut(); }}>
      <Box key={location.pathname} className="rise">
        <Routes location={location}>
          <Route path="/dashboard" element={<DashboardPage name={name} />} />
          <Route path="/activities" element={<ActivitiesPage />} />
          <Route path="/activities/:id" element={<ActivityDetail />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Box>
    </Layout>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
