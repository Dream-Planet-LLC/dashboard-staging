import axios from "axios";

const getAuthToken = () =>
  typeof window !== "undefined"
    ? localStorage.getItem("auth_token")
    : null;

const authenticatedAxios = axios.create();

authenticatedAxios.interceptors.request.use((config) => {
  const token = getAuthToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const authenticatedFetch = (
  input: RequestInfo | URL,
  init: RequestInit = {},
) => {
  const headers = new Headers(init.headers);
  const token = getAuthToken();

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return globalThis.fetch(input, { ...init, headers });
};

export default authenticatedAxios;
