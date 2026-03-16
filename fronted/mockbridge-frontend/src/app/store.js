import { configureStore } from '@reduxjs/toolkit';

import authReducer from '../features/auth/authSlice';
import profileReducer from '../features/profile/profileSlice';
import interviewReducer from '../features/interview/interviewSlice';
import uiReducer from '../features/ui/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    interview: interviewReducer,
    ui: uiReducer,
  },
});
