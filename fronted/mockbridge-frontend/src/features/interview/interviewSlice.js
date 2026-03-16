import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { interviewApi, userApi } from '../../api/modules';
import { normalizeApiError } from '../../utils/http';

function compareStartTimes(a, b) {
  return new Date(`${a.startTimeUtc}Z`) - new Date(`${b.startTimeUtc}Z`);
}

function normalizeSearchValue(value) {
  return String(value || '').trim().toLowerCase();
}

function buildFallbackProfile(userId, fallbackName = 'Member') {
  return {
    userId,
    fullName: fallbackName,
    headline: 'Profile not available yet',
    bio: '',
    yearsOfExperience: 0,
    averageRating: 0,
    skills: [],
  };
}

function groupSlotsByInterviewer(slots) {
  return slots.reduce((map, slot) => {
    const current = map.get(slot.interviewerId) || [];
    current.push(slot);
    map.set(slot.interviewerId, current);
    return map;
  }, new Map());
}

async function loadProfilesByIds(userIds, fallbackName = 'Member') {
  const uniqueIds = [...new Set((userIds || []).filter(Boolean))];

  if (!uniqueIds.length) {
    return [];
  }

  const results = await Promise.all(
    uniqueIds.map(async (userId) => {
      try {
        return await userApi.getPublicProfile(userId);
      } catch {
        return buildFallbackProfile(userId, fallbackName);
      }
    }),
  );

  return results;
}

async function loadProfileMapByIds(userIds, fallbackName = 'Member') {
  const profiles = await loadProfilesByIds(userIds, fallbackName);
  return new Map(profiles.map((profile) => [profile.userId, profile]));
}

function profileMatchesSearch(profile, query) {
  if (!query) {
    return true;
  }

  const haystack = [
    profile.fullName,
    profile.headline,
    profile.bio,
    ...(profile.skills || []).flatMap((skill) => [skill.skillName, skill.proficiency]),
  ]
    .map(normalizeSearchValue)
    .filter(Boolean)
    .join(' ');

  return haystack.includes(query);
}

function hydrateMarketplaceItems(uniqueInterviewerIds, groupedSlots, profileMap) {
  return uniqueInterviewerIds
    .map((userId) => {
      const profile = profileMap.get(userId) || buildFallbackProfile(userId, 'Interviewer');
      const slots = [...(groupedSlots.get(userId) || [])]
        .sort(compareStartTimes)
        .map((slot) => ({
          ...slot,
          interviewerName: profile.fullName || 'Interviewer',
          interviewerHeadline: profile.headline || '',
        }));

      return {
        userId,
        fullName: profile.fullName || 'Interviewer',
        headline: profile.headline || 'Mock interview expert',
        bio: profile.bio || '',
        yearsOfExperience: profile.yearsOfExperience || 0,
        averageRating: Number(profile.averageRating || 0),
        skills: profile.skills || [],
        slots,
      };
    })
    .sort((left, right) => {
      const leftHasSlots = left.slots.length > 0;
      const rightHasSlots = right.slots.length > 0;

      if (leftHasSlots && rightHasSlots) {
        return compareStartTimes(left.slots[0], right.slots[0]);
      }

      if (leftHasSlots) {
        return -1;
      }

      if (rightHasSlots) {
        return 1;
      }

      return left.fullName.localeCompare(right.fullName);
    });
}

function dedupeProfilesByUserId(profiles) {
  const unique = new Map();

  for (const profile of profiles || []) {
    if (profile?.userId) {
      unique.set(profile.userId, profile);
    }
  }

  return [...unique.values()];
}

function filterMarketplaceItems(items, normalizedQuery, backendMatchedIds) {
  if (!normalizedQuery) {
    return items;
  }

  return items.filter((item) => {
    if (backendMatchedIds.has(item.userId)) {
      return true;
    }

    return profileMatchesSearch(item, normalizedQuery);
  });
}

function sortMarketplaceItems(items, normalizedQuery, backendMatchedIds) {
  if (!normalizedQuery) {
    return items;
  }

  return [...items].sort((left, right) => {
    const leftBackendMatch = backendMatchedIds.has(left.userId);
    const rightBackendMatch = backendMatchedIds.has(right.userId);

    if (leftBackendMatch && !rightBackendMatch) {
      return -1;
    }

    if (!leftBackendMatch && rightBackendMatch) {
      return 1;
    }

    const leftHasSlots = left.slots.length > 0;
    const rightHasSlots = right.slots.length > 0;

    if (leftHasSlots && rightHasSlots) {
      return compareStartTimes(left.slots[0], right.slots[0]);
    }

    if (leftHasSlots) {
      return -1;
    }

    if (rightHasSlots) {
      return 1;
    }

    return left.fullName.localeCompare(right.fullName);
  });
}

function createInitialState() {
  return {
    marketplace: {
      items: [],
      status: 'idle',
      error: null,
      lastQuery: '',
    },
    mySlots: {
      items: [],
      status: 'idle',
      error: null,
    },
    incomingRequests: {
      items: [],
      status: 'idle',
      error: null,
      filter: 'PENDING',
    },
    myBookings: {
      items: [],
      status: 'idle',
      error: null,
    },
    sessionLookup: {
      data: null,
      status: 'idle',
      error: null,
    },
    mutation: {
      status: 'idle',
      error: null,
      kind: null,
    },
  };
}

export const fetchMarketplace = createAsyncThunk(
  'interview/fetchMarketplace',
  async (searchText = '', { getState, rejectWithValue }) => {
    try {
      const query = String(searchText || '').trim();
      const normalizedQuery = normalizeSearchValue(query);
      const currentUserId = getState().auth.user?.userId || null;

      const openSlots = await interviewApi.getOpenSlots();

      const filteredOpenSlots = currentUserId
        ? openSlots.filter((slot) => slot.interviewerId !== currentUserId)
        : openSlots;

      const sortedSlots = [...filteredOpenSlots].sort(compareStartTimes);
      const groupedSlots = groupSlotsByInterviewer(sortedSlots);
      const slotInterviewerIds = [
        ...new Set(sortedSlots.map((slot) => slot.interviewerId).filter(Boolean)),
      ];

      let searchProfiles = [];

      if (normalizedQuery) {
        searchProfiles = await userApi.searchInterviewers(query).catch(() => []);
      }

      const mergedSearchProfiles = dedupeProfilesByUserId(
        currentUserId
          ? searchProfiles.filter((profile) => profile?.userId !== currentUserId)
          : searchProfiles,
      );

      const allInterviewerIds = [
        ...new Set([
          ...slotInterviewerIds,
          ...mergedSearchProfiles.map((profile) => profile.userId).filter(Boolean),
        ]),
      ];

      if (!allInterviewerIds.length) {
        return {
          items: [],
          lastQuery: query,
        };
      }

      const profileMap = await loadProfileMapByIds(allInterviewerIds, 'Interviewer');

      for (const profile of mergedSearchProfiles) {
        if (profile?.userId) {
          profileMap.set(profile.userId, profile);
        }
      }

      const backendMatchedIds = new Set(
        mergedSearchProfiles.map((profile) => profile.userId).filter(Boolean),
      );

      const baseItems = hydrateMarketplaceItems(
        allInterviewerIds,
        groupedSlots,
        profileMap,
      );

      const filteredItems = filterMarketplaceItems(
        baseItems,
        normalizedQuery,
        backendMatchedIds,
      );

      const items = sortMarketplaceItems(
        filteredItems,
        normalizedQuery,
        backendMatchedIds,
      );

      return {
        items,
        lastQuery: query,
      };
    } catch (error) {
      return rejectWithValue(normalizeApiError(error));
    }
  },
);

export const bookMarketplaceSlot = createAsyncThunk(
  'interview/bookMarketplaceSlot',
  async (slotId, { rejectWithValue }) => {
    try {
      return await interviewApi.bookSlot(slotId);
    } catch (error) {
      return rejectWithValue(normalizeApiError(error));
    }
  },
);

export const fetchMySlots = createAsyncThunk(
  'interview/fetchMySlots',
  async (_, { rejectWithValue }) => {
    try {
      return await interviewApi.getMySlots();
    } catch (error) {
      return rejectWithValue(normalizeApiError(error));
    }
  },
);

export const createAvailabilitySlot = createAsyncThunk(
  'interview/createAvailabilitySlot',
  async (payload, { rejectWithValue }) => {
    try {
      return await interviewApi.createSlot(payload);
    } catch (error) {
      return rejectWithValue(normalizeApiError(error));
    }
  },
);

export const cancelAvailabilitySlot = createAsyncThunk(
  'interview/cancelAvailabilitySlot',
  async (slotId, { rejectWithValue }) => {
    try {
      await interviewApi.cancelSlot(slotId);
      return slotId;
    } catch (error) {
      return rejectWithValue(normalizeApiError(error));
    }
  },
);

export const deleteAvailabilitySlot = createAsyncThunk(
  'interview/deleteAvailabilitySlot',
  async (slotId, { rejectWithValue }) => {
    try {
      await interviewApi.hardDeleteSlot(slotId);
      return slotId;
    } catch (error) {
      return rejectWithValue(normalizeApiError(error));
    }
  },
);

export const fetchIncomingBookingRequests = createAsyncThunk(
  'interview/fetchIncomingBookingRequests',
  async (status = 'PENDING', { rejectWithValue }) => {
    try {
      const rawItems = await interviewApi.getIncomingBookingRequests(status);
      const studentMap = await loadProfileMapByIds(
        rawItems.map((item) => item.studentId),
        'Candidate',
      );

      const items = rawItems.map((item) => {
        const studentProfile =
          studentMap.get(item.studentId) ||
          buildFallbackProfile(item.studentId, 'Candidate');

        return {
          ...item,
          studentName: studentProfile.fullName || 'Candidate',
          studentHeadline: studentProfile.headline || '',
        };
      });

      return {
        items,
        filter: status,
      };
    } catch (error) {
      return rejectWithValue(normalizeApiError(error));
    }
  },
);

export const confirmIncomingBooking = createAsyncThunk(
  'interview/confirmIncomingBooking',
  async (bookingId, { rejectWithValue }) => {
    try {
      return await interviewApi.confirmBooking(bookingId);
    } catch (error) {
      return rejectWithValue(normalizeApiError(error));
    }
  },
);

export const fetchMyBookings = createAsyncThunk(
  'interview/fetchMyBookings',
  async (_, { rejectWithValue }) => {
    try {
      const rawItems = await interviewApi.getMyBookings();
      const interviewerMap = await loadProfileMapByIds(
        rawItems.map((item) => item.interviewerId),
        'Interviewer',
      );

      return rawItems.map((item) => {
        const interviewerProfile =
          interviewerMap.get(item.interviewerId) ||
          buildFallbackProfile(item.interviewerId, 'Interviewer');

        return {
          ...item,
          interviewerName: interviewerProfile.fullName || 'Interviewer',
          interviewerHeadline: interviewerProfile.headline || '',
        };
      });
    } catch (error) {
      return rejectWithValue(normalizeApiError(error));
    }
  },
);

export const fetchBookingSession = createAsyncThunk(
  'interview/fetchBookingSession',
  async (bookingId, { rejectWithValue }) => {
    try {
      return await interviewApi.getSession(bookingId);
    } catch (error) {
      return rejectWithValue(normalizeApiError(error));
    }
  },
);

const initialState = createInitialState();

const interviewSlice = createSlice({
  name: 'interview',
  initialState,
  reducers: {
    clearInterviewMutation(state) {
      state.mutation = {
        status: 'idle',
        error: null,
        kind: null,
      };
    },
    clearSessionLookup(state) {
      state.sessionLookup = {
        data: null,
        status: 'idle',
        error: null,
      };
    },
    resetInterviewState() {
      return createInitialState();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMarketplace.pending, (state) => {
        state.marketplace.status = 'loading';
        state.marketplace.error = null;
      })
      .addCase(fetchMarketplace.fulfilled, (state, action) => {
        state.marketplace.status = 'succeeded';
        state.marketplace.items = action.payload.items;
        state.marketplace.lastQuery = action.payload.lastQuery;
      })
      .addCase(fetchMarketplace.rejected, (state, action) => {
        state.marketplace.status = 'failed';
        state.marketplace.error = action.payload || null;
      })

      .addCase(fetchMySlots.pending, (state) => {
        state.mySlots.status = 'loading';
        state.mySlots.error = null;
      })
      .addCase(fetchMySlots.fulfilled, (state, action) => {
        state.mySlots.status = 'succeeded';
        state.mySlots.items = action.payload;
      })
      .addCase(fetchMySlots.rejected, (state, action) => {
        state.mySlots.status = 'failed';
        state.mySlots.error = action.payload || null;
      })

      .addCase(fetchIncomingBookingRequests.pending, (state) => {
        state.incomingRequests.status = 'loading';
        state.incomingRequests.error = null;
      })
      .addCase(fetchIncomingBookingRequests.fulfilled, (state, action) => {
        state.incomingRequests.status = 'succeeded';
        state.incomingRequests.items = action.payload.items;
        state.incomingRequests.filter = action.payload.filter;
      })
      .addCase(fetchIncomingBookingRequests.rejected, (state, action) => {
        state.incomingRequests.status = 'failed';
        state.incomingRequests.error = action.payload || null;
      })

      .addCase(fetchMyBookings.pending, (state) => {
        state.myBookings.status = 'loading';
        state.myBookings.error = null;
      })
      .addCase(fetchMyBookings.fulfilled, (state, action) => {
        state.myBookings.status = 'succeeded';
        state.myBookings.items = action.payload;
      })
      .addCase(fetchMyBookings.rejected, (state, action) => {
        state.myBookings.status = 'failed';
        state.myBookings.error = action.payload || null;
      })

      .addCase(fetchBookingSession.pending, (state) => {
        state.sessionLookup.status = 'loading';
        state.sessionLookup.error = null;
      })
      .addCase(fetchBookingSession.fulfilled, (state, action) => {
        state.sessionLookup.status = 'succeeded';
        state.sessionLookup.data = action.payload;
      })
      .addCase(fetchBookingSession.rejected, (state, action) => {
        state.sessionLookup.status = 'failed';
        state.sessionLookup.error = action.payload || null;
      })

      .addCase(createAvailabilitySlot.pending, (state) => {
        state.mutation.status = 'loading';
        state.mutation.kind = 'create-slot';
        state.mutation.error = null;
      })
      .addCase(createAvailabilitySlot.fulfilled, (state, action) => {
        state.mutation.status = 'succeeded';
        state.mutation.kind = 'create-slot';
        state.mySlots.items = [action.payload, ...state.mySlots.items];
      })
      .addCase(createAvailabilitySlot.rejected, (state, action) => {
        state.mutation.status = 'failed';
        state.mutation.kind = 'create-slot';
        state.mutation.error = action.payload || null;
      })

      .addCase(cancelAvailabilitySlot.pending, (state) => {
        state.mutation.status = 'loading';
        state.mutation.kind = 'cancel-slot';
        state.mutation.error = null;
      })
      .addCase(cancelAvailabilitySlot.fulfilled, (state, action) => {
        state.mutation.status = 'succeeded';
        state.mutation.kind = 'cancel-slot';
        state.mySlots.items = state.mySlots.items.map((slot) =>
          slot.id === action.payload
            ? {
                ...slot,
                status: 'CANCELLED',
              }
            : slot,
        );
      })
      .addCase(cancelAvailabilitySlot.rejected, (state, action) => {
        state.mutation.status = 'failed';
        state.mutation.kind = 'cancel-slot';
        state.mutation.error = action.payload || null;
      })

      .addCase(deleteAvailabilitySlot.pending, (state) => {
        state.mutation.status = 'loading';
        state.mutation.kind = 'delete-slot';
        state.mutation.error = null;
      })
      .addCase(deleteAvailabilitySlot.fulfilled, (state, action) => {
        state.mutation.status = 'succeeded';
        state.mutation.kind = 'delete-slot';
        state.mySlots.items = state.mySlots.items.filter((slot) => slot.id !== action.payload);
      })
      .addCase(deleteAvailabilitySlot.rejected, (state, action) => {
        state.mutation.status = 'failed';
        state.mutation.kind = 'delete-slot';
        state.mutation.error = action.payload || null;
      })

      .addCase(bookMarketplaceSlot.pending, (state) => {
        state.mutation.status = 'loading';
        state.mutation.kind = 'book-slot';
        state.mutation.error = null;
      })
      .addCase(bookMarketplaceSlot.fulfilled, (state) => {
        state.mutation.status = 'succeeded';
        state.mutation.kind = 'book-slot';
      })
      .addCase(bookMarketplaceSlot.rejected, (state, action) => {
        state.mutation.status = 'failed';
        state.mutation.kind = 'book-slot';
        state.mutation.error = action.payload || null;
      })

      .addCase(confirmIncomingBooking.pending, (state) => {
        state.mutation.status = 'loading';
        state.mutation.kind = 'confirm-booking';
        state.mutation.error = null;
      })
      .addCase(confirmIncomingBooking.fulfilled, (state) => {
        state.mutation.status = 'succeeded';
        state.mutation.kind = 'confirm-booking';
      })
      .addCase(confirmIncomingBooking.rejected, (state, action) => {
        state.mutation.status = 'failed';
        state.mutation.kind = 'confirm-booking';
        state.mutation.error = action.payload || null;
      });
  },
});

export const { clearInterviewMutation, clearSessionLookup, resetInterviewState } =
  interviewSlice.actions;

export default interviewSlice.reducer;