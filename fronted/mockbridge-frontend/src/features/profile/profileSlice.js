import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../../lib/http';
import { getApiErrorMessage, getStatusCode } from '../../lib/error';
import { forceLogout, logoutUser } from '../auth/authSlice';

const initialState = {
  profile: null,
  publicProfile: null,
  searchResults: [],
  status: 'idle',
  publicProfileStatus: 'idle',
  searchStatus: 'idle',
  mutationStatus: 'idle',
  error: null,
  searchError: null,
  onboardingRequired: false,
  loadedForUserId: null,
};

export const fetchMyProfile = createAsyncThunk(
  'profile/fetchMyProfile',
  async (_, { getState, rejectWithValue }) => {
    const userId = getState().auth.user?.userId || null;

    try {
      const response = await api.get('/users/me');
      return {
        ...response.data,
        loadedUserId: userId,
      };
    } catch (error) {
      return rejectWithValue({
        status: getStatusCode(error),
        message: getApiErrorMessage(error, 'Failed to load your profile.'),
        userId,
      });
    }
  },
);

export const createMyProfile = createAsyncThunk(
  'profile/createMyProfile',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post('/users/me', payload);
      return response.data;
    } catch (error) {
      return rejectWithValue({
        status: getStatusCode(error),
        message: getApiErrorMessage(error, 'Failed to create profile.'),
      });
    }
  },
);

export const updateMyProfile = createAsyncThunk(
  'profile/updateMyProfile',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.put('/users/me', payload);
      return response.data;
    } catch (error) {
      return rejectWithValue({
        status: getStatusCode(error),
        message: getApiErrorMessage(error, 'Failed to update profile.'),
      });
    }
  },
);

export const addMySkill = createAsyncThunk(
  'profile/addMySkill',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post('/users/me/skills', payload);
      return response.data;
    } catch (error) {
      return rejectWithValue({
        status: getStatusCode(error),
        message: getApiErrorMessage(error, 'Failed to add skill.'),
      });
    }
  },
);

export const deleteMySkill = createAsyncThunk(
  'profile/deleteMySkill',
  async (skillId, { rejectWithValue }) => {
    try {
      await api.delete(`/users/me/skills/${skillId}`);
      return skillId;
    } catch (error) {
      return rejectWithValue({
        status: getStatusCode(error),
        message: getApiErrorMessage(error, 'Failed to delete skill.'),
      });
    }
  },
);

export const searchInterviewers = createAsyncThunk(
  'profile/searchInterviewers',
  async (skill, { rejectWithValue }) => {
    try {
      const response = await api.get('/users/search/interviewers', {
        params: { skill },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Search failed.'));
    }
  },
);

export const fetchPublicProfile = createAsyncThunk(
  'profile/fetchPublicProfile',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to load profile.'));
    }
  },
);

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearProfileError(state) {
      state.error = null;
      state.searchError = null;
    },
    clearSearchResults(state) {
      state.searchResults = [];
      state.searchStatus = 'idle';
      state.searchError = null;
    },
    resetProfileState(state) {
      state.profile = null;
      state.publicProfile = null;
      state.searchResults = [];
      state.status = 'idle';
      state.publicProfileStatus = 'idle';
      state.searchStatus = 'idle';
      state.mutationStatus = 'idle';
      state.error = null;
      state.searchError = null;
      state.onboardingRequired = false;
      state.loadedForUserId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyProfile.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchMyProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.profile = action.payload;
        state.onboardingRequired = false;
        state.loadedForUserId = action.payload.userId || action.payload.loadedUserId || null;
      })
      .addCase(fetchMyProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.profile = null;
        state.error = action.payload?.message || 'Failed to load profile.';
        state.onboardingRequired = action.payload?.status === 404;
        state.loadedForUserId = action.payload?.userId || null;
      })
      .addCase(createMyProfile.pending, (state) => {
        state.mutationStatus = 'loading';
        state.error = null;
      })
      .addCase(createMyProfile.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded';
        state.profile = action.payload;
        state.onboardingRequired = false;
        state.loadedForUserId = action.payload.userId;
      })
      .addCase(createMyProfile.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.error = action.payload?.message || 'Failed to create profile.';
      })
      .addCase(updateMyProfile.pending, (state) => {
        state.mutationStatus = 'loading';
        state.error = null;
      })
      .addCase(updateMyProfile.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded';
        state.profile = action.payload;
        state.onboardingRequired = false;
      })
      .addCase(updateMyProfile.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.error = action.payload?.message || 'Failed to update profile.';
      })
      .addCase(addMySkill.pending, (state) => {
        state.mutationStatus = 'loading';
        state.error = null;
      })
      .addCase(addMySkill.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded';
        if (state.profile) {
          state.profile.skills = [...(state.profile.skills || []), action.payload];
        }
      })
      .addCase(addMySkill.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.error = action.payload?.message || 'Failed to add skill.';
      })
      .addCase(deleteMySkill.pending, (state) => {
        state.mutationStatus = 'loading';
        state.error = null;
      })
      .addCase(deleteMySkill.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded';
        if (state.profile) {
          state.profile.skills = (state.profile.skills || []).filter((skill) => skill.id !== action.payload);
        }
      })
      .addCase(deleteMySkill.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.error = action.payload?.message || 'Failed to delete skill.';
      })
      .addCase(searchInterviewers.pending, (state) => {
        state.searchStatus = 'loading';
        state.searchError = null;
      })
      .addCase(searchInterviewers.fulfilled, (state, action) => {
        state.searchStatus = 'succeeded';
        state.searchResults = action.payload;
      })
      .addCase(searchInterviewers.rejected, (state, action) => {
        state.searchStatus = 'failed';
        state.searchError = action.payload || 'Search failed.';
      })
      .addCase(fetchPublicProfile.pending, (state) => {
        state.publicProfileStatus = 'loading';
      })
      .addCase(fetchPublicProfile.fulfilled, (state, action) => {
        state.publicProfileStatus = 'succeeded';
        state.publicProfile = action.payload;
      })
      .addCase(fetchPublicProfile.rejected, (state, action) => {
        state.publicProfileStatus = 'failed';
        state.error = action.payload || 'Failed to load profile.';
      })
      .addCase(forceLogout, () => ({ ...initialState }))
      .addCase(logoutUser.fulfilled, () => ({ ...initialState }))
      .addCase(logoutUser.rejected, () => ({ ...initialState }));
  },
});

export const { clearProfileError, clearSearchResults, resetProfileState } = profileSlice.actions;
export default profileSlice.reducer;
