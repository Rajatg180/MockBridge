export const tokenStorage = {
  getAccess() {
    return localStorage.getItem("accessToken") || "";
  },
  getRefresh() {
    return localStorage.getItem("refreshToken") || "";
  },
  setTokens({ accessToken, refreshToken }) {
    if (accessToken) localStorage.setItem("accessToken", accessToken);
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
  },
  setAccess(accessToken) {
    if (accessToken) localStorage.setItem("accessToken", accessToken);
  },
  clear() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  },
};