import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import profileReducer from "../features/profile/profileSlice";
import uiReducer from "../features/ui/uiSlice";
import interviewReducer from "../features/interview/interviewSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    ui: uiReducer,
    interview: interviewReducer,
  },
});