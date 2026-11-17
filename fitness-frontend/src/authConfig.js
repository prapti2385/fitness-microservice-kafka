import {
  useAuthContext,
  AuthProvider,
  TAuthConfig,
  TRefreshTokenExpiredEvent,
} from "react-oauth2-code-pkce";
export const authConfig = {
  clientId: "oauth2-pkce-client",
  authorizationEndpoint: "http://127.0.0.1:8181/realms/fitness-realm/protocol/openid-connect/auth",
  tokenEndpoint: "http://127.0.0.1:8181/realms/fitness-realm/protocol/openid-connect/token",
  redirectUri: "http://localhost:5173/",
  scope: "openid profile email offline_access",
  onRefreshTokenExpire: (event) => event.logIn(),
};
