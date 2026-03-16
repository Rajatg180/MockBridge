import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { userApi } from '../../api/modules';
import { normalizeApiError } from '../../utils/http';

const initialState = {
  profile: null,
  status: 'idle',
  saveStatus: 'idle',
  skillStatus: 'idle',
  error: null,
  notFound: false,
};

export const fetchMyProfile = createAsyncThunk(
  'profile/fetchMyProfile',
  async (_, { rejectWithValue }) => {
    try {
      return await userApi.getMyProfile();
    } catch (error) {
      return rejectWithValue(normalizeApiError(error));
    }
  },
);

export const saveMyProfile = createAsyncThunk(
  'profile/saveMyProfile',
  async (payload, { getState, rejectWithValue }) => {
    try {
      const hasProfile = Boolean(getState().profile.profile);

      if (hasProfile) {
        return await userApi.updateMyProfile(payload);
      }

      return await userApi.createMyProfile(payload);
    } catch (error) {
      return rejectWithValue(normalizeApiError(error));
    }
  },
);

export const addProfileSkill = createAsyncThunk(
  'profile/addProfileSkill',
  async (payload, { rejectWithValue }) => {
    try {
      return await userApi.addMySkill(payload);
    } catch (error) {
      return rejectWithValue(normalizeApiError(error));
    }
  },
);

export const deleteProfileSkill = createAsyncThunk(
  'profile/deleteProfileSkill',
  async (skillId, { rejectWithValue }) => {
    try {
      await userApi.deleteMySkill(skillId);
      return skillId;
    } catch (error) {
      return rejectWithValue(normalizeApiError(error));
    }
  },
);

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    resetProfileState(state) {
      state.profile = null;
      state.status = 'idle';
      state.saveStatus = 'idle';
      state.skillStatus = 'idle';
      state.error = null;
      state.notFound = false;
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
        state.error = null;
        state.notFound = false;
      })
      .addCase(fetchMyProfile.rejected, (state, action) => {
        if (action.payload?.status === 404) {
          state.status = 'not-found';
          state.profile = null;
          state.notFound = true;
          state.error = null;
          return;
        }

        state.status = 'failed';
        state.error = action.payload || null;
      })

      .addCase(saveMyProfile.pending, (state) => {
        state.saveStatus = 'loading';
        state.error = null;
      })
      .addCase(saveMyProfile.fulfilled, (state, action) => {
        state.saveStatus = 'succeeded';
        state.profile = action.payload;
        state.notFound = false;
        state.status = 'succeeded';
      })
      .addCase(saveMyProfile.rejected, (state, action) => {
        state.saveStatus = 'failed';
        state.error = action.payload || null;
      })

      .addCase(addProfileSkill.pending, (state) => {
        state.skillStatus = 'loading';
        state.error = null;
      })
      .addCase(addProfileSkill.fulfilled, (state, action) => {
        state.skillStatus = 'succeeded';

        if (state.profile) {
          state.profile.skills = [...(state.profile.skills || []), action.payload];
        }
      })
      .addCase(addProfileSkill.rejected, (state, action) => {
        state.skillStatus = 'failed';
        state.error = action.payload || null;
      })

      .addCase(deleteProfileSkill.pending, (state) => {
        state.skillStatus = 'loading';
        state.error = null;
      })
      .addCase(deleteProfileSkill.fulfilled, (state, action) => {
        state.skillStatus = 'succeeded';

        if (state.profile) {
          state.profile.skills = (state.profile.skills || []).filter(
            (skill) => skill.id !== action.payload,
          );
        }
      })
      .addCase(deleteProfileSkill.rejected, (state, action) => {
        state.skillStatus = 'failed';
        state.error = action.payload || null;
      });
  },
});

export const { resetProfileState } = profileSlice.actions;
export default profileSlice.reducer;
