import axios from "axios";
import { clearUser } from "@/redux/slices/adminslice";
import { persistor, store } from "@/redux/store";

const getAuthToken = () =>
  typeof window !== "undefined"
    ? localStorage.getItem("auth_token")
    : null;

const authenticatedAxios = axios.create();
let unauthorizedRedirect: Promise<void> | null = null;

const handleUnauthorized = () => {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (unauthorizedRedirect) {
    return unauthorizedRedirect;
  }

  localStorage.removeItem("auth_token");
  store.dispatch(clearUser());

  unauthorizedRedirect = persistor
    .flush()
    .catch(() => undefined)
    .then(() => {
      if (window.location.pathname !== "/login") {
        window.location.replace("/login");
      }
    });

  return unauthorizedRedirect;
};

authenticatedAxios.interceptors.request.use((config) => {
  const token = getAuthToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

authenticatedAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await handleUnauthorized();
    }

    return Promise.reject(error);
  },
);

export const authenticatedFetch = async (
  input: RequestInfo | URL,
  init: RequestInit = {},
) => {
  const headers = new Headers(init.headers);
  const token = getAuthToken();

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await globalThis.fetch(input, { ...init, headers });

  if (response.status === 401) {
    await handleUnauthorized();
  }

  return response;
};

export default authenticatedAxios;
