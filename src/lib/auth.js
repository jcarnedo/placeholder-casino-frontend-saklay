import { setAuthToken } from "./api";

const TOKEN_KEY = "sakla_token";

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
  setAuthToken(token); // ✅ add this
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  setAuthToken(null); // ✅ add this
}

export function isLoggedIn() {
  return !!getToken();
}
