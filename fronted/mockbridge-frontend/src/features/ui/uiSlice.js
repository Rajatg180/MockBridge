import { createSlice, nanoid } from "@reduxjs/toolkit";

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    toasts: [], // {id, type, title, message}
  },
  reducers: {
    toastAdded: {
      reducer(state, action) {
        state.toasts.push(action.payload);
      },
      prepare({ type = "info", title = "", message = "" }) {
        return { payload: { id: nanoid(), type, title, message } };
      },
    },
    toastRemoved(state, action) {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
    clearToasts(state) {
      state.toasts = [];
    },
  },
});

export const { toastAdded, toastRemoved, clearToasts } = uiSlice.actions;
export default uiSlice.reducer;