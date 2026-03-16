import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { authApi } from '../../api/modules';
import {
  clearStoredSession,
  loadStoredSession,
  saveStoredSession,
} from '../../utils/storage';
import { normalizeApiError } from '../../utils/http';

const initialSession = loadStoredSession();

const initialState = {
  accessToken: initialSession.accessToken,
  refreshToken: initialSession.refreshToken,
  user: null,
  isBootstrapping: true,
  status: 'idle',
  error: null,
};

async function establishSession(authResponse) {
  saveStoredSession(authResponse);

  try {
    const user = await authApi.getMe();
    const latest = loadStoredSession();

    return {
      accessToken: latest.accessToken,
      refreshToken: latest.refreshToken,
      user,
    };
  } catch (error) {
    clearStoredSession();
    throw error;
  }
}

export const bootstrapSession = createAsyncThunk(
  'auth/bootstrapSession',
  async (_, { rejectWithValue }) => {
    const session = loadStoredSession();

    if (!session.accessToken) {
      return {
        accessToken: null,
        refreshToken: session.refreshToken,
        user: null,
      };
    }

    try {
      const user = await authApi.getMe();
      const latest = loadStoredSession();

      return {
        accessToken: latest.accessToken,
        refreshToken: latest.refreshToken,
        user,
      };
    } catch (error) {
      const latest = loadStoredSession();

      if (!latest.accessToken) {
        return {
          accessToken: null,
          refreshToken: null,
          user: null,
        };
      }

      return rejectWithValue(normalizeApiError(error));
    }
  },
);

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials);
      return await establishSession(response);
    } catch (error) {
      return rejectWithValue(normalizeApiError(error));
    }
  },
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await authApi.register(payload);
      return await establishSession(response);
    } catch (error) {
      return rejectWithValue(normalizeApiError(error));
    }
  },
);

export const logoutUser = createAsyncThunk('auth/logoutUser', async () => {
  const session = loadStoredSession();

  try {
    if (session.refreshToken) {
      await authApi.logout(session.refreshToken);
    }
  } catch {
    // Best effort logout.
  } finally {
    clearStoredSession();
  }

  return true;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    sessionRefreshed(state, action) {
      state.accessToken = action.payload.accessToken || null;
      state.refreshToken = action.payload.refreshToken || null;
    },
    sessionExpired(state) {
      state.accessToken = null;
      state.refreshToken = null;
      state.user = null;
      state.status = 'idle';
      state.error = null;
      state.isBootstrapping = false;
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(bootstrapSession.pending, (state) => {
        state.isBootstrapping = true;
        state.error = null;
      })
      .addCase(bootstrapSession.fulfilled, (state, action) => {
        state.isBootstrapping = false;
        state.accessToken = action.payload.accessToken || null;
        state.refreshToken = action.payload.refreshToken || null;
        state.user = action.payload.user || null;
      })
      .addCase(bootstrapSession.rejected, (state, action) => {
        state.isBootstrapping = false;
        state.error = action.payload || null;
      })

      .addCase(loginUser.pending, (state) => {
        state.status = 'signingIn';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'authenticated';
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'idle';
        state.error = action.payload || null;
      })

      .addCase(registerUser.pending, (state) => {
        state.status = 'registering';
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = 'authenticated';
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'idle';
        state.error = action.payload || null;
      })

      .addCase(logoutUser.pending, (state) => {
        state.status = 'signingOut';
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.status = 'idle';
        state.accessToken = null;
        state.refreshToken = null;
        state.user = null;
        state.error = null;
      });
  },
});

export const { sessionRefreshed, sessionExpired, clearAuthError } =
  authSlice.actions;

export default authSlice.reducer;
