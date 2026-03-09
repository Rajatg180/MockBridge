import { authClient } from "./apiClient";

const loginApi = async ({ email, password }) => {
  const response = await authClient.post("/auth/login", {
    email,
    password,
  });
  return response.data;
};

const registerApi = async ({email, password}) => {
  const response = await authClient.post("/auth/register", {
    email,
    password,
  });
  return response.data;
};

const logoutApi = async () => {
  const response = await authClient.post("/auth/logout");
  return response.data;
};

const authApi = {
  loginApi,
  registerApi,
  logoutApi,
};

export default authApi;