import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../../lib/http';
import { getApiErrorMessage } from '../../lib/error';
import { getPersistedState } from '../../lib/storage';
import { forceLogout, logoutUser } from '../auth/authSlice';

const persisted = getPersistedState();

const initialState = {
  openSlots: [],
  openSlotsStatus: 'idle',
  mutationStatus: 'idle',
  sessionStatus: 'idle',
  error: null,
  workspace: persisted.workspace || {
    createdSlots: [],
    bookings: [],
    sessions: [],
  },
};

export const fetchOpenSlots = createAsyncThunk(
  'interviews/fetchOpenSlots',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/interviews/slots/open');
      return response.data;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to fetch open slots.'));
    }
  },
);

export const createSlot = createAsyncThunk(
  'interviews/createSlot',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post('/interviews/slots', payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to create slot.'));
    }
  },
);

export const bookSlot = createAsyncThunk(
  'interviews/bookSlot',
  async (slotId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/interviews/slots/${slotId}/book`);
      return response.data;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to book slot.'));
    }
  },
);

export const confirmBooking = createAsyncThunk(
  'interviews/confirmBooking',
  async (bookingId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/interviews/bookings/${bookingId}/confirm`);
      return response.data;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to confirm booking.'));
    }
  },
);

export const fetchSession = createAsyncThunk(
  'interviews/fetchSession',
  async (bookingId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/interviews/bookings/${bookingId}/session`);
      return response.data;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to fetch session.'));
    }
  },
);

function prependUnique(items, nextItem, key) {
  const filtered = items.filter((item) => item[key] !== nextItem[key]);
  return [nextItem, ...filtered].slice(0, 10);
}

const interviewSlice = createSlice({
  name: 'interviews',
  initialState,
  reducers: {
    clearInterviewError(state) {
      state.error = null;
    },
    clearWorkspace(state) {
      state.workspace = {
        createdSlots: [],
        bookings: [],
        sessions: [],
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOpenSlots.pending, (state) => {
        state.openSlotsStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchOpenSlots.fulfilled, (state, action) => {
        state.openSlotsStatus = 'succeeded';
        state.openSlots = action.payload;
      })
      .addCase(fetchOpenSlots.rejected, (state, action) => {
        state.openSlotsStatus = 'failed';
        state.error = action.payload || 'Failed to fetch slots.';
      })
      .addCase(createSlot.pending, (state) => {
        state.mutationStatus = 'loading';
        state.error = null;
      })
      .addCase(createSlot.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded';
        state.workspace.createdSlots = prependUnique(state.workspace.createdSlots, action.payload, 'id');
        state.openSlots = prependUnique(state.openSlots, action.payload, 'id');
      })
      .addCase(createSlot.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.error = action.payload || 'Failed to create slot.';
      })
      .addCase(bookSlot.pending, (state) => {
        state.mutationStatus = 'loading';
        state.error = null;
      })
      .addCase(bookSlot.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded';
        state.workspace.bookings = prependUnique(state.workspace.bookings, action.payload, 'bookingId');
        state.openSlots = state.openSlots.filter((slot) => slot.id !== action.payload.slotId);
      })
      .addCase(bookSlot.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.error = action.payload || 'Failed to book slot.';
      })
      .addCase(confirmBooking.pending, (state) => {
        state.mutationStatus = 'loading';
        state.error = null;
      })
      .addCase(confirmBooking.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded';
        state.workspace.sessions = prependUnique(state.workspace.sessions, action.payload, 'sessionId');
      })
      .addCase(confirmBooking.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.error = action.payload || 'Failed to confirm booking.';
      })
      .addCase(fetchSession.pending, (state) => {
        state.sessionStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchSession.fulfilled, (state, action) => {
        state.sessionStatus = 'succeeded';
        state.workspace.sessions = prependUnique(state.workspace.sessions, action.payload, 'sessionId');
      })
      .addCase(fetchSession.rejected, (state, action) => {
        state.sessionStatus = 'failed';
        state.error = action.payload || 'Failed to fetch session.';
      })
      .addCase(forceLogout, (state) => {
        state.openSlots = [];
        state.openSlotsStatus = 'idle';
        state.mutationStatus = 'idle';
        state.sessionStatus = 'idle';
        state.error = null;
        state.workspace = { createdSlots: [], bookings: [], sessions: [] };
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.openSlots = [];
        state.openSlotsStatus = 'idle';
        state.mutationStatus = 'idle';
        state.sessionStatus = 'idle';
        state.error = null;
        state.workspace = { createdSlots: [], bookings: [], sessions: [] };
      })
      .addCase(logoutUser.rejected, (state) => {
        state.openSlots = [];
        state.openSlotsStatus = 'idle';
        state.mutationStatus = 'idle';
        state.sessionStatus = 'idle';
        state.error = null;
        state.workspace = { createdSlots: [], bookings: [], sessions: [] };
      });
  },
});

export const { clearInterviewError, clearWorkspace } = interviewSlice.actions;
export default interviewSlice.reducer;
