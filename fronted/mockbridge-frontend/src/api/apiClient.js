import axios from "axios";
import { store } from "../app/store";
import { accessTokenUpdated, loggedOut } from "../features/auth/authSlice";
import { toastAdded } from "../features/ui/uiSlice";
import { tokenStorage } from "../features/auth/tokenStorage";

export const api = axios.create({
  baseURL: "http://localhost:8082",
  headers: { "Content-Type": "application/json" },
});

export const authClient = axios.create({
  baseURL: "http://localhost:8082",
  headers: { "Content-Type": "application/json" },
});

export function extractApiMessage(error) {
  const data = error?.response?.data;
  if (typeof data?.message === "string" && data.message.trim()) return data.message;
  if (typeof data?.error === "string" && data.error.trim()) return data.error;
  if (typeof error?.message === "string" && error.message.trim()) return error.message;
  return "Something went wrong";
}

let isRefreshing = false;
let queue = [];

function resolveQueue(err, newToken) {
  queue.forEach(({ resolve, reject }) => (err ? reject(err) : resolve(newToken)));
  queue = [];
}

async function refreshAccessToken() {
  const refreshToken = tokenStorage.getRefresh();
  if (!refreshToken) throw new Error("Missing refresh token");

  const res = await authClient.post("/auth/refresh", { refreshToken });
  return res.data?.accessToken;
}

let attached = false;
export function attachApiInterceptors() {
  if (attached) return;
  attached = true;

  api.interceptors.request.use((config) => {
    const url = config.url || "";
    if (!url.startsWith("/auth/")) {
      const token = tokenStorage.getAccess();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  });

  api.interceptors.response.use(
    (res) => res,
    async (error) => {
      const original = error.config;

      if (!error.response || error.response.status !== 401) {
        return Promise.reject(error);
      }

      if (original?._retry) {
        return Promise.reject(error);
      }
      original._retry = true;

      if ((original?.url || "").startsWith("/auth/")) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject });
        }).then((newToken) => {
          original.headers.Authorization = `Bearer ${newToken}`;
          return api(original);
        });
      }

      isRefreshing = true;

      try {
        const newAccess = await refreshAccessToken();
        if (!newAccess) throw new Error("Refresh did not return access token");

        store.dispatch(accessTokenUpdated(newAccess));
        resolveQueue(null, newAccess);

        original.headers.Authorization = `Bearer ${newAccess}`;
        return api(original);
      } catch (e) {
        resolveQueue(e, null);
        store.dispatch(
          toastAdded({
            type: "error",
            title: "Session expired",
            message: extractApiMessage(e) || "Please sign in again.",
          })
        );
        store.dispatch(loggedOut());
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }
  );
}

export function showApiErrorToast(error, title = "Request failed") {
  store.dispatch(
    toastAdded({
      type: "error",
      title,
      message: extractApiMessage(error),
    })
  );
}