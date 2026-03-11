import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../lib/http";
import { getApiErrorMessage } from "../../lib/error";
import { getPersistedState } from "../../lib/storage";
import { forceLogout, logoutUser } from "../auth/authSlice";

const persisted = getPersistedState();

const initialState = {
  openSlots: [],
  openSlotsStatus: "idle",

  mySlots: [],
  mySlotsStatus: "idle",

  bookingRequests: [],
  bookingRequestsStatus: "idle",

  myBookings: [],
  myBookingsStatus: "idle",

  mutationStatus: "idle",
  sessionStatus: "idle",

  error: null,

  workspace: persisted.workspace || {
    createdSlots: [],
    bookings: [],
    sessions: [],
  },
};

export const fetchOpenSlots = createAsyncThunk(
  "interviews/fetchOpenSlots",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/interviews/slots/open");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to fetch open slots."),
      );
    }
  },
);

export const fetchMySlots = createAsyncThunk(
  "interviews/fetchMySlots",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/interviews/me/slots");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to fetch my slots."),
      );
    }
  },
);

export const cancelSlot = createAsyncThunk(
  "interviews/cancelSlot",
  async (slotId, { rejectWithValue }) => {
    try {
      await api.delete(`/interviews/slots/${slotId}`);
      return slotId;
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to cancel slot."),
      );
    }
  },
);

export const deleteSlot = createAsyncThunk(
  "interviews/deleteSlot",
  async (slotId, { rejectWithValue }) => {
    try {
      await api.delete(`/interviews/slots/${slotId}/hard-delete`);
      return slotId;
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to delete slot."),
      );
    }
  },
);

export const fetchIncomingBookingRequests = createAsyncThunk(
  "interviews/fetchIncomingBookingRequests",
  async (status = "PENDING", { rejectWithValue }) => {
    try {
      const response = await api.get("/interviews/me/booking-requests", {
        params: status && status !== "ALL" ? { status } : undefined,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to fetch booking requests."),
      );
    }
  },
);

export const fetchMyBookings = createAsyncThunk(
  "interviews/fetchMyBookings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/interviews/me/bookings");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to fetch my bookings."),
      );
    }
  },
);

export const createSlot = createAsyncThunk(
  "interviews/createSlot",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post("/interviews/slots", payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to create slot."),
      );
    }
  },
);

export const bookSlot = createAsyncThunk(
  "interviews/bookSlot",
  async (slotId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/interviews/slots/${slotId}/book`);
      return response.data;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Failed to book slot."));
    }
  },
);

export const confirmBooking = createAsyncThunk(
  "interviews/confirmBooking",
  async (bookingId, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/interviews/bookings/${bookingId}/confirm`,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to confirm booking."),
      );
    }
  },
);

export const fetchSession = createAsyncThunk(
  "interviews/fetchSession",
  async (bookingId, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/interviews/bookings/${bookingId}/session`,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to fetch session."),
      );
    }
  },
);

function prependUnique(items, nextItem, key) {
  const filtered = items.filter((item) => item[key] !== nextItem[key]);
  return [nextItem, ...filtered].slice(0, 10);
}

const interviewSlice = createSlice({
  name: "interviews",
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
        state.openSlotsStatus = "loading";
        state.error = null;
      })
      .addCase(fetchOpenSlots.fulfilled, (state, action) => {
        state.openSlotsStatus = "succeeded";
        state.openSlots = action.payload;
      })
      .addCase(fetchOpenSlots.rejected, (state, action) => {
        state.openSlotsStatus = "failed";
        state.error = action.payload || "Failed to fetch slots.";
      })

      .addCase(fetchMySlots.pending, (state) => {
        state.mySlotsStatus = "loading";
        state.error = null;
      })
      .addCase(fetchMySlots.fulfilled, (state, action) => {
        state.mySlotsStatus = "succeeded";
        state.mySlots = action.payload;
      })
      .addCase(fetchMySlots.rejected, (state, action) => {
        state.mySlotsStatus = "failed";
        state.error = action.payload || "Failed to fetch my slots.";
      })

      .addCase(fetchIncomingBookingRequests.pending, (state) => {
        state.bookingRequestsStatus = "loading";
        state.error = null;
      })
      .addCase(fetchIncomingBookingRequests.fulfilled, (state, action) => {
        state.bookingRequestsStatus = "succeeded";
        state.bookingRequests = action.payload;
      })
      .addCase(fetchIncomingBookingRequests.rejected, (state, action) => {
        state.bookingRequestsStatus = "failed";
        state.error = action.payload || "Failed to fetch booking requests.";
      })

      .addCase(fetchMyBookings.pending, (state) => {
        state.myBookingsStatus = "loading";
        state.error = null;
      })
      .addCase(fetchMyBookings.fulfilled, (state, action) => {
        state.myBookingsStatus = "succeeded";
        state.myBookings = action.payload;
      })
      .addCase(fetchMyBookings.rejected, (state, action) => {
        state.myBookingsStatus = "failed";
        state.error = action.payload || "Failed to fetch my bookings.";
      })

      .addCase(createSlot.pending, (state) => {
        state.mutationStatus = "loading";
        state.error = null;
      })
      .addCase(createSlot.fulfilled, (state, action) => {
        state.mutationStatus = "succeeded";
        state.workspace.createdSlots = prependUnique(
          state.workspace.createdSlots,
          action.payload,
          "id",
        );
        state.openSlots = prependUnique(state.openSlots, action.payload, "id");
        state.mySlots = prependUnique(state.mySlots, action.payload, "id");
      })
      .addCase(createSlot.rejected, (state, action) => {
        state.mutationStatus = "failed";
        state.error = action.payload || "Failed to create slot.";
      })

      .addCase(bookSlot.pending, (state) => {
        state.mutationStatus = "loading";
        state.error = null;
      })
      .addCase(bookSlot.fulfilled, (state, action) => {
        state.mutationStatus = "succeeded";
        state.workspace.bookings = prependUnique(
          state.workspace.bookings,
          action.payload,
          "bookingId",
        );
        state.openSlots = state.openSlots.filter(
          (slot) => slot.id !== action.payload.slotId,
        );
        state.mySlots = state.mySlots.map((slot) =>
          slot.id === action.payload.slotId
            ? { ...slot, status: "BOOKED" }
            : slot,
        );
      })
      .addCase(bookSlot.rejected, (state, action) => {
        state.mutationStatus = "failed";
        state.error = action.payload || "Failed to book slot.";
      })

      .addCase(confirmBooking.pending, (state) => {
        state.mutationStatus = "loading";
        state.error = null;
      })
      .addCase(confirmBooking.fulfilled, (state, action) => {
        state.mutationStatus = "succeeded";
        state.bookingRequests = state.bookingRequests.filter(
          (request) => request.bookingId !== action.payload.bookingId,
        );
        state.workspace.sessions = prependUnique(
          state.workspace.sessions,
          action.payload,
          "sessionId",
        );
      })
      .addCase(confirmBooking.rejected, (state, action) => {
        state.mutationStatus = "failed";
        state.error = action.payload || "Failed to confirm booking.";
      })

      .addCase(fetchSession.pending, (state) => {
        state.sessionStatus = "loading";
        state.error = null;
      })
      .addCase(fetchSession.fulfilled, (state, action) => {
        state.sessionStatus = "succeeded";
        state.workspace.sessions = prependUnique(
          state.workspace.sessions,
          action.payload,
          "sessionId",
        );
      })
      .addCase(fetchSession.rejected, (state, action) => {
        state.sessionStatus = "failed";
        state.error = action.payload || "Failed to fetch session.";
      })

      .addCase(cancelSlot.pending, (state) => {
        state.mutationStatus = "loading";
        state.error = null;
      })
      .addCase(cancelSlot.fulfilled, (state, action) => {
        state.mutationStatus = "succeeded";

        state.mySlots = state.mySlots.map((slot) =>
          slot.id === action.payload ? { ...slot, status: "CANCELLED" } : slot,
        );

        state.openSlots = state.openSlots.filter(
          (slot) => slot.id !== action.payload,
        );

        state.workspace.createdSlots = state.workspace.createdSlots.map(
          (slot) =>
            slot.id === action.payload
              ? { ...slot, status: "CANCELLED" }
              : slot,
        );
      })
      .addCase(cancelSlot.rejected, (state, action) => {
        state.mutationStatus = "failed";
        state.error = action.payload || "Failed to cancel slot.";
      })

      .addCase(deleteSlot.pending, (state) => {
        state.mutationStatus = "loading";
        state.error = null;
      })
      .addCase(deleteSlot.fulfilled, (state, action) => {
        state.mutationStatus = "succeeded";

        state.mySlots = state.mySlots.filter((slot) => slot.id !== action.payload);
        state.openSlots = state.openSlots.filter((slot) => slot.id !== action.payload);
        state.workspace.createdSlots = state.workspace.createdSlots.filter(
          (slot) => slot.id !== action.payload,
        );
      })
      .addCase(deleteSlot.rejected, (state, action) => {
        state.mutationStatus = "failed";
        state.error = action.payload || "Failed to delete slot.";
      })

      .addCase(forceLogout, (state) => {
        state.openSlots = [];
        state.mySlots = [];
        state.bookingRequests = [];
        state.myBookings = [];
        state.workspace = { createdSlots: [], bookings: [], sessions: [] };
        state.openSlotsStatus = "idle";
        state.mySlotsStatus = "idle";
        state.bookingRequestsStatus = "idle";
        state.myBookingsStatus = "idle";
        state.mutationStatus = "idle";
        state.sessionStatus = "idle";
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.openSlots = [];
        state.mySlots = [];
        state.bookingRequests = [];
        state.myBookings = [];
        state.workspace = { createdSlots: [], bookings: [], sessions: [] };
        state.openSlotsStatus = "idle";
        state.mySlotsStatus = "idle";
        state.bookingRequestsStatus = "idle";
        state.myBookingsStatus = "idle";
        state.mutationStatus = "idle";
        state.sessionStatus = "idle";
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.openSlots = [];
        state.mySlots = [];
        state.bookingRequests = [];
        state.myBookings = [];
        state.workspace = { createdSlots: [], bookings: [], sessions: [] };
        state.openSlotsStatus = "idle";
        state.mySlotsStatus = "idle";
        state.bookingRequestsStatus = "idle";
        state.myBookingsStatus = "idle";
        state.mutationStatus = "idle";
        state.sessionStatus = "idle";
        state.error = null;
      });
  },
});

export const { clearInterviewError, clearWorkspace } = interviewSlice.actions;
export default interviewSlice.reducer;