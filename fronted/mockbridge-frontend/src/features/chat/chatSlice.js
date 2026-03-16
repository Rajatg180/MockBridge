import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { chatApi } from '../../api/modules';
import { normalizeApiError } from '../../utils/http';

const initialState = {
  items: [],
  status: 'idle',
  error: null,
  sendStatus: 'idle',
  sendError: null,
  bookingId: null,
};

export const fetchChatMessages = createAsyncThunk(
  'chat/fetchChatMessages',
  async (bookingId, { rejectWithValue }) => {
    try {
      const data = await chatApi.getMessages(bookingId);
      return {
        bookingId,
        items: data,
      };
    } catch (error) {
      return rejectWithValue(normalizeApiError(error));
    }
  },
);

export const sendChatMessage = createAsyncThunk(
  'chat/sendChatMessage',
  async ({ bookingId, content }, { rejectWithValue }) => {
    try {
      const data = await chatApi.sendMessage(bookingId, { content });
      return data;
    } catch (error) {
      return rejectWithValue(normalizeApiError(error));
    }
  },
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    resetChatState() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChatMessages.pending, (state) => {
        if (!state.items.length) {
          state.status = 'loading';
        }
        state.error = null;
      })
      .addCase(fetchChatMessages.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.items || [];
        state.bookingId = action.payload.bookingId;
        state.error = null;
      })
      .addCase(fetchChatMessages.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || null;
      })

      .addCase(sendChatMessage.pending, (state) => {
        state.sendStatus = 'loading';
        state.sendError = null;
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.sendStatus = 'succeeded';
        state.sendError = null;

        const exists = state.items.some((item) => item.id === action.payload.id);
        if (!exists) {
          state.items.push(action.payload);
        }
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.sendStatus = 'failed';
        state.sendError = action.payload || null;
      });
  },
});

export const { resetChatState } = chatSlice.actions;
export default chatSlice.reducer;