import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { AuthProvider } from "react-oauth2-code-pkce";
import { store } from "./store/store.js";
import App from "./App";
import { authConfig } from "./authConfig.js";
import AppThemeProvider from "./theme/ThemeProvider.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider authConfig={authConfig}>
    <Provider store={store}>
      <AppThemeProvider>
        <App />
      </AppThemeProvider>
    </Provider>
  </AuthProvider>,
);