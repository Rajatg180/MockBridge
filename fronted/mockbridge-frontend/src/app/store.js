import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import profileReducer from '../features/profile/profileSlice';
import interviewsReducer from '../features/interviews/interviewSlice';
import { persistSelectedState } from '../lib/storage';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    interviews: interviewsReducer,
  },
});

store.subscribe(() => {
  const state = store.getState();
  persistSelectedState({
    auth: {
      accessToken: state.auth.accessToken,
      refreshToken: state.auth.refreshToken,
    },
    workspace: state.interviews.workspace,
  });
});
