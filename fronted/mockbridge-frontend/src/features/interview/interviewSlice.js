import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  bookSlot,
  confirmBooking,
  createSlot,
  getOpenSlots,
  getSessionByBookingId,
} from "../../api/interviewApi";
import { extractApiMessage } from "../../api/apiClient";

export const fetchOpenSlots = createAsyncThunk(
  "interview/fetchOpenSlots",
  async (_, { rejectWithValue }) => {
    try {
      return await getOpenSlots();
    } catch (error) {
      return rejectWithValue(extractApiMessage(error));
    }
  }
);

export const submitCreateSlot = createAsyncThunk(
  "interview/submitCreateSlot",
  async (payload, { rejectWithValue }) => {
    try {
      return await createSlot(payload);
    } catch (error) {
      return rejectWithValue(extractApiMessage(error));
    }
  }
);

export const submitBookSlot = createAsyncThunk(
  "interview/submitBookSlot",
  async (slotId, { rejectWithValue }) => {
    try {
      return await bookSlot(slotId);
    } catch (error) {
      return rejectWithValue(extractApiMessage(error));
    }
  }
);

export const submitConfirmBooking = createAsyncThunk(
  "interview/submitConfirmBooking",
  async (bookingId, { rejectWithValue }) => {
    try {
      return await confirmBooking(bookingId);
    } catch (error) {
      return rejectWithValue(extractApiMessage(error));
    }
  }
);

export const fetchSessionByBookingId = createAsyncThunk(
  "interview/fetchSessionByBookingId",
  async (bookingId, { rejectWithValue }) => {
    try {
      const data = await getSessionByBookingId(bookingId);
      return { bookingId, data };
    } catch (error) {
      return rejectWithValue(extractApiMessage(error));
    }
  }
);

const interviewSlice = createSlice({
  name: "interview",
  initialState: {
    openSlots: [],
    openSlotsStatus: "idle",
    openSlotsError: "",

    createSlotStatus: "idle",
    bookSlotStatus: "idle",
    confirmStatus: "idle",
    sessionStatus: "idle",

    recentCreatedSlot: null,
    recentBooking: null,
    recentConfirmedSession: null,

    sessionsByBookingId: {},
    error: "",
  },
  reducers: {
    interviewStateCleared(state) {
      state.openSlots = [];
      state.openSlotsStatus = "idle";
      state.openSlotsError = "";
      state.createSlotStatus = "idle";
      state.bookSlotStatus = "idle";
      state.confirmStatus = "idle";
      state.sessionStatus = "idle";
      state.recentCreatedSlot = null;
      state.recentBooking = null;
      state.recentConfirmedSession = null;
      state.sessionsByBookingId = {};
      state.error = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOpenSlots.pending, (state) => {
        state.openSlotsStatus = "loading";
        state.openSlotsError = "";
      })
      .addCase(fetchOpenSlots.fulfilled, (state, action) => {
        state.openSlotsStatus = "succeeded";
        state.openSlots = action.payload;
      })
      .addCase(fetchOpenSlots.rejected, (state, action) => {
        state.openSlotsStatus = "failed";
        state.openSlotsError = action.payload || "Failed to load open slots";
      })

      .addCase(submitCreateSlot.pending, (state) => {
        state.createSlotStatus = "loading";
        state.error = "";
      })
      .addCase(submitCreateSlot.fulfilled, (state, action) => {
        state.createSlotStatus = "succeeded";
        state.recentCreatedSlot = action.payload;
        state.openSlots = [action.payload, ...state.openSlots];
      })
      .addCase(submitCreateSlot.rejected, (state, action) => {
        state.createSlotStatus = "failed";
        state.error = action.payload || "Failed to create slot";
      })

      .addCase(submitBookSlot.pending, (state) => {
        state.bookSlotStatus = "loading";
        state.error = "";
      })
      .addCase(submitBookSlot.fulfilled, (state, action) => {
        state.bookSlotStatus = "succeeded";
        state.recentBooking = action.payload;
        state.openSlots = state.openSlots.filter((s) => s.id !== action.payload.slotId);
      })
      .addCase(submitBookSlot.rejected, (state, action) => {
        state.bookSlotStatus = "failed";
        state.error = action.payload || "Failed to book slot";
      })

      .addCase(submitConfirmBooking.pending, (state) => {
        state.confirmStatus = "loading";
        state.error = "";
      })
      .addCase(submitConfirmBooking.fulfilled, (state, action) => {
        state.confirmStatus = "succeeded";
        state.recentConfirmedSession = action.payload;
      })
      .addCase(submitConfirmBooking.rejected, (state, action) => {
        state.confirmStatus = "failed";
        state.error = action.payload || "Failed to confirm booking";
      })

      .addCase(fetchSessionByBookingId.pending, (state) => {
        state.sessionStatus = "loading";
        state.error = "";
      })
      .addCase(fetchSessionByBookingId.fulfilled, (state, action) => {
        state.sessionStatus = "succeeded";
        state.sessionsByBookingId[action.payload.bookingId] = action.payload.data;
      })
      .addCase(fetchSessionByBookingId.rejected, (state, action) => {
        state.sessionStatus = "failed";
        state.error = action.payload || "Failed to load session";
      });
  },
});

export const { interviewStateCleared } = interviewSlice.actions;
export default interviewSlice.reducer;