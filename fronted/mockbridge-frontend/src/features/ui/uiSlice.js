import { createSlice } from '@reduxjs/toolkit';

function createToastId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    toasts: [],
  },
  reducers: {
    addToast: {
      reducer(state, action) {
        state.toasts.push(action.payload);
      },
      prepare(toast) {
        return {
          payload: {
            id: createToastId(),
            type: toast?.type || 'info',
            title: toast?.title || 'Notice',
            message: toast?.message || '',
            duration: toast?.duration || 4500,
          },
        };
      },
    },
    removeToast(state, action) {
      state.toasts = state.toasts.filter((toast) => toast.id !== action.payload);
    },
    clearToasts(state) {
      state.toasts = [];
    },
  },
});

export const { addToast, removeToast, clearToasts } = uiSlice.actions;
export default uiSlice.reducer;
