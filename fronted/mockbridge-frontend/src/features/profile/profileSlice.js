import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  createProfile,
  getMyProfile,
  updateProfile,
  addSkill,
  deleteSkill,
} from "../../api/userApi";
import { extractApiMessage } from "../../api/apiClient";

export const fetchMyProfile = createAsyncThunk(
  "profile/fetchMyProfile",
  async (_, { rejectWithValue }) => {
    try {
      return await getMyProfile();
    } catch (error) {
      // ✅ Freshly registered user may not have a profile yet.
      // Treat 404 as a valid "empty state", not as an error.
      if (error?.response?.status === 404) {
        return null;
      }

      return rejectWithValue(extractApiMessage(error));
    }
  }
);

export const saveProfile = createAsyncThunk(
  "profile/saveProfile",
  async ({ exists, payload }, { rejectWithValue }) => {
    try {
      return exists ? await updateProfile(payload) : await createProfile(payload);
    } catch (error) {
      return rejectWithValue(extractApiMessage(error));
    }
  }
);

export const createSkill = createAsyncThunk(
  "profile/createSkill",
  async (payload, { rejectWithValue }) => {
    try {
      return await addSkill(payload);
    } catch (error) {
      return rejectWithValue(extractApiMessage(error));
    }
  }
);

export const removeSkill = createAsyncThunk(
  "profile/removeSkill",
  async (skillId, { rejectWithValue }) => {
    try {
      await deleteSkill(skillId);
      return skillId;
    } catch (error) {
      return rejectWithValue(extractApiMessage(error));
    }
  }
);

const profileSlice = createSlice({
  name: "profile",
  initialState: {
    data: null,
    status: "idle",
    saveStatus: "idle",
    skillStatus: "idle",
    error: "",
    hasCheckedProfile: false,
  },
  reducers: {
    profileCleared(state) {
      state.data = null;
      state.status = "idle";
      state.saveStatus = "idle";
      state.skillStatus = "idle";
      state.error = "";
      state.hasCheckedProfile = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyProfile.pending, (state) => {
        state.status = "loading";
        state.error = "";
      })
      .addCase(fetchMyProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload; // can be null if profile doesn't exist yet
        state.error = "";
        state.hasCheckedProfile = true;
      })
      .addCase(fetchMyProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to load profile";
        state.data = null;
        state.hasCheckedProfile = true;
      })

      .addCase(saveProfile.pending, (state) => {
        state.saveStatus = "loading";
        state.error = "";
      })
      .addCase(saveProfile.fulfilled, (state, action) => {
        state.saveStatus = "succeeded";
        state.data = action.payload;
        state.error = "";
        state.hasCheckedProfile = true;
      })
      .addCase(saveProfile.rejected, (state, action) => {
        state.saveStatus = "failed";
        state.error = action.payload || "Failed to save profile";
      })

      .addCase(createSkill.pending, (state) => {
        state.skillStatus = "loading";
      })
      .addCase(createSkill.fulfilled, (state, action) => {
        state.skillStatus = "succeeded";
        if (state.data) {
          state.data.skills = [...(state.data.skills || []), action.payload];
        }
      })
      .addCase(createSkill.rejected, (state, action) => {
        state.skillStatus = "failed";
        state.error = action.payload || "Failed to add skill";
      })

      .addCase(removeSkill.pending, (state) => {
        state.skillStatus = "loading";
      })
      .addCase(removeSkill.fulfilled, (state, action) => {
        state.skillStatus = "succeeded";
        if (state.data) {
          state.data.skills = (state.data.skills || []).filter((s) => s.id !== action.payload);
        }
      })
      .addCase(removeSkill.rejected, (state, action) => {
        state.skillStatus = "failed";
        state.error = action.payload || "Failed to delete skill";
      });
  },
});

export const { profileCleared } = profileSlice.actions;
export default profileSlice.reducer;