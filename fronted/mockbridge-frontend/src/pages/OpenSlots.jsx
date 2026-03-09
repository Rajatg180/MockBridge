import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Shell from "../ui/Shell";
import SectionCard from "../ui/SectionCard";
import LoadingBlock from "../ui/LoadingBlock";
import EmptyState from "../ui/EmptyState";
import StatusBadge from "../ui/StatusBadge";
import { fetchOpenSlots, submitBookSlot } from "../features/interview/interviewSlice";
import { toastAdded } from "../features/ui/uiSlice";
import { useNavigate } from "react-router-dom";

export default function OpenSlots() {
  const dispatch = useDispatch();
  const nav = useNavigate();

  const {
    openSlots,
    openSlotsStatus,
    openSlotsError,
    bookSlotStatus,
    recentBooking,
  } = useSelector((s) => s.interview);

  useEffect(() => {
    dispatch(fetchOpenSlots());
  }, [dispatch]);

  const onBook = async (slotId) => {
    const action = await dispatch(submitBookSlot(slotId));
    if (submitBookSlot.fulfilled.match(action)) {
      dispatch(
        toastAdded({
          type: "success",
          title: "Slot booked",
          message: "Booking request created with PENDING status.",
        })
      );
      nav("/interviews/actions", { state: { bookingId: action.payload.bookingId } });
    } else {
      dispatch(
        toastAdded({
          type: "error",
          title: "Booking failed",
          message: action.payload || "Could not book slot.",
        })
      );
    }
  };

  return (
    <Shell title="Open Slots" subtitle="Browse all currently available interview slots">
      <div style={{ display: "grid", gap: 16 }}>
        {recentBooking ? (
          <SectionCard title="Most recent booking">
            <div style={{ display: "grid", gap: 8 }}>
              <div><b>Booking ID:</b> {recentBooking.bookingId}</div>
              <div><b>Slot ID:</b> {recentBooking.slotId}</div>
              <div><StatusBadge value={recentBooking.status} /></div>
            </div>
          </SectionCard>
        ) : null}

        <SectionCard
          title="Available slots"
          right={
            <button onClick={() => dispatch(fetchOpenSlots())} style={secondaryButton}>
              Refresh
            </button>
          }
        >
          {openSlotsStatus === "loading" ? (
            <LoadingBlock label="Loading open slots..." />
          ) : openSlotsStatus === "failed" ? (
            <EmptyState title="Could not load slots" message={openSlotsError || "Try again."} />
          ) : openSlots.length === 0 ? (
            <EmptyState
              title="No open slots"
              message="Create a slot yourself or come back later."
              action={
                <button onClick={() => nav("/interviews/create-slot")} style={primaryButton}>
                  Create Slot
                </button>
              }
            />
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {openSlots.map((slot) => (
                <div
                  key={slot.id}
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: 16,
                    padding: 14,
                    display: "grid",
                    gap: 8,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                    <div style={{ fontWeight: 900 }}>Slot ID: {slot.id}</div>
                    <StatusBadge value={slot.status} />
                  </div>
                  <div><b>Interviewer User ID:</b> {slot.interviewerId}</div>
                  <div><b>Start:</b> {slot.startTimeUtc}</div>
                  <div><b>End:</b> {slot.endTimeUtc}</div>

                  <div style={{ marginTop: 4 }}>
                    <button
                      onClick={() => onBook(slot.id)}
                      disabled={bookSlotStatus === "loading"}
                      style={primaryButton}
                    >
                      {bookSlotStatus === "loading" ? "Booking..." : "Book Slot"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </Shell>
  );
}

const primaryButton = {
  padding: "10px 12px",
  borderRadius: 12,
  border: 0,
  background: "#0f172a",
  color: "white",
  cursor: "pointer",
  fontWeight: 800,
};

const secondaryButton = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #e2e8f0",
  background: "white",
  cursor: "pointer",
  fontWeight: 800,
};