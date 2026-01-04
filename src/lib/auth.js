import { setAuthToken } from "./api";

const KEY = "sakla_token";

export function saveToken(token) {
  localStorage.setItem(KEY, token);
  setAuthToken(token);
}

export function loadToken() {
  const token = localStorage.getItem(KEY);
  if (token) setAuthToken(token);
  return token;
}

export function clearToken() {
  localStorage.removeItem(KEY);
  setAuthToken(null);
}
