import { authClient } from "./apiClient";

export async function register(email, password) {
  const res = await authClient.post("/auth/register", { email, password });
  return res.data;
}

export async function login(email, password) {
  const res = await authClient.post("/auth/login", { email, password });
  return res.data;
}

export async function refresh(refreshToken) {
  const res = await authClient.post("/auth/refresh", { refreshToken });
  return res.data;
}

export async function logoutApi(refreshToken) {
  await authClient.post("/auth/logout", { refreshToken });
}