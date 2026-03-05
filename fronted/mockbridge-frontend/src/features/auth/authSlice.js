import { createSlice } from "@reduxjs/toolkit";
import { tokenStorage } from "./tokenStorage";

function decodeJwtPayload(token) {
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function buildUser(accessToken) {
  if (!accessToken) return null;
  const p = decodeJwtPayload(accessToken);
  if (!p) return null;
  return {
    userId: p.sub,
    email: p.email,
    role: p.role,
    exp: p.exp,
  };
}

const initialAccess = tokenStorage.getAccess();
const initialRefresh = tokenStorage.getRefresh();

const authSlice = createSlice({
  name: "auth",
  initialState: {
    accessToken: initialAccess,
    refreshToken: initialRefresh,
    user: buildUser(initialAccess),
  },
  reducers: {
    loggedIn(state, action) {
      const { accessToken, refreshToken } = action.payload;
      state.accessToken = accessToken || "";
      state.refreshToken = refreshToken || "";
      state.user = buildUser(accessToken || "");
      tokenStorage.setTokens({ accessToken, refreshToken });
    },
    accessTokenUpdated(state, action) {
      const accessToken = action.payload || "";
      state.accessToken = accessToken;
      state.user = buildUser(accessToken);
      tokenStorage.setAccess(accessToken);
    },
    loggedOut(state) {
      state.accessToken = "";
      state.refreshToken = "";
      state.user = null;
      tokenStorage.clear();
    },
  },
});

export const { loggedIn, accessTokenUpdated, loggedOut } = authSlice.actions;
export default authSlice.reducer;