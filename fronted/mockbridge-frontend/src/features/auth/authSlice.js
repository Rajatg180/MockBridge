import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../../lib/http';
import { clearPersistedState, getPersistedState } from '../../lib/storage';
import { extractUserFromAccessToken } from '../../lib/jwt';
import { getApiErrorMessage } from '../../lib/error';

const persisted = getPersistedState();
const persistedAuth = persisted.auth || {};

const initialState = {
  accessToken: persistedAuth.accessToken || null,
  refreshToken: persistedAuth.refreshToken || null,
  user: persistedAuth.accessToken ? extractUserFromAccessToken(persistedAuth.accessToken) : null,
  status: 'idle',
  bootStatus: 'idle',
  error: null,
  initialized: false,
};

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Login failed.'));
    }
  },
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register', payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Registration failed.'));
    }
  },
);

export const bootstrapSession = createAsyncThunk(
  'auth/bootstrapSession',
  async (_, { getState, rejectWithValue }) => {
    const state = getState();
    const refreshToken = state.auth.refreshToken || persistedAuth.refreshToken;

    if (!refreshToken) {
      return { accessToken: null, refreshToken: null };
    }

    try {
      const response = await api.post('/auth/refresh', { refreshToken });
      return {
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken || refreshToken,
      };
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Session restore failed.'));
    }
  },
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { getState }) => {
    const refreshToken = getState().auth.refreshToken;

    try {
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } finally {
      return true;
    }
  },
);

function applyTokens(state, payload) {
  state.accessToken = payload?.accessToken || null;
  state.refreshToken = payload?.refreshToken || null;
  state.user = payload?.accessToken ? extractUserFromAccessToken(payload.accessToken) : null;
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    tokensRefreshed(state, action) {
      applyTokens(state, action.payload);
      state.error = null;
      state.initialized = true;
    },
    forceLogout(state) {
      state.accessToken = null;
      state.refreshToken = null;
      state.user = null;
      state.error = null;
      state.status = 'idle';
      state.bootStatus = 'idle';
      state.initialized = true;
      clearPersistedState();
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.initialized = true;
        applyTokens(state, action.payload);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.initialized = true;
        state.error = action.payload || 'Login failed.';
      })
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.initialized = true;
        applyTokens(state, action.payload);
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.initialized = true;
        state.error = action.payload || 'Registration failed.';
      })
      .addCase(bootstrapSession.pending, (state) => {
        state.bootStatus = 'loading';
        state.error = null;
      })
      .addCase(bootstrapSession.fulfilled, (state, action) => {
        state.bootStatus = 'succeeded';
        state.initialized = true;
        applyTokens(state, action.payload);
      })
      .addCase(bootstrapSession.rejected, (state, action) => {
        state.bootStatus = 'failed';
        state.initialized = true;
        state.accessToken = null;
        state.refreshToken = null;
        state.user = null;
        state.error = action.payload || null;
        clearPersistedState();
      })
      .addCase(logoutUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.status = 'idle';
        state.bootStatus = 'idle';
        state.accessToken = null;
        state.refreshToken = null;
        state.user = null;
        state.error = null;
        state.initialized = true;
        clearPersistedState();
      })
      .addCase(logoutUser.rejected, (state) => {
        state.status = 'idle';
        state.bootStatus = 'idle';
        state.accessToken = null;
        state.refreshToken = null;
        state.user = null;
        state.error = null;
        state.initialized = true;
        clearPersistedState();
      });
  },
});

export const { tokensRefreshed, forceLogout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
