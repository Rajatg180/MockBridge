import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Shell from "../ui/Shell";
import SectionCard from "../ui/SectionCard";
import StatusBadge from "../ui/StatusBadge";
import { fetchSessionByBookingId, submitConfirmBooking } from "../features/interview/interviewSlice";
import { toastAdded } from "../features/ui/uiSlice";
import { useLocation, useNavigate } from "react-router-dom";

export default function BookingActions() {
  const dispatch = useDispatch();
  const nav = useNavigate();
  const location = useLocation();

  const recentBooking = useSelector((s) => s.interview.recentBooking);
  const recentConfirmedSession = useSelector((s) => s.interview.recentConfirmedSession);
  const confirmStatus = useSelector((s) => s.interview.confirmStatus);
  const sessionStatus = useSelector((s) => s.interview.sessionStatus);
  const sessionsByBookingId = useSelector((s) => s.interview.sessionsByBookingId);

  const presetBookingId = location.state?.bookingId || recentBooking?.bookingId || "";
  const [bookingId, setBookingId] = useState(presetBookingId);

  useEffect(() => {
    if (!bookingId && presetBookingId) {
      setBookingId(presetBookingId);
    }
  }, [bookingId, presetBookingId]);

  const onConfirm = async () => {
    if (!bookingId.trim()) {
      dispatch(
        toastAdded({
          type: "error",
          title: "Missing booking ID",
          message: "Enter a booking ID first.",
        })
      );
      return;
    }

    const action = await dispatch(submitConfirmBooking(bookingId.trim()));
    if (submitConfirmBooking.fulfilled.match(action)) {
      dispatch(
        toastAdded({
          type: "success",
          title: "Booking confirmed",
          message: "Session created successfully.",
        })
      );
    } else {
      dispatch(
        toastAdded({
          type: "error",
          title: "Confirm failed",
          message: action.payload || "Could not confirm booking.",
        })
      );
    }
  };

  const onFetchSession = async () => {
    if (!bookingId.trim()) {
      dispatch(
        toastAdded({
          type: "error",
          title: "Missing booking ID",
          message: "Enter a booking ID first.",
        })
      );
      return;
    }

    const action = await dispatch(fetchSessionByBookingId(bookingId.trim()));
    if (fetchSessionByBookingId.fulfilled.match(action)) {
      dispatch(
        toastAdded({
          type: "success",
          title: "Session loaded",
          message: "Session details fetched successfully.",
        })
      );
      nav(`/interviews/session/${bookingId.trim()}`);
    } else {
      dispatch(
        toastAdded({
          type: "error",
          title: "Load session failed",
          message: action.payload || "Could not load session.",
        })
      );
    }
  };

  const currentSession = sessionsByBookingId[bookingId] || null;

  return (
    <Shell
      title="Booking Actions"
      subtitle="Use this page to confirm a booking or fetch session details by booking ID"
    >
      <div style={{ display: "grid", gap: 16 }}>
        <SectionCard title="Booking ID input">
          <div style={{ display: "grid", gap: 12, maxWidth: 640 }}>
            <input
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
              placeholder="Paste booking UUID"
              style={inputStyle}
            />

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                onClick={onConfirm}
                disabled={confirmStatus === "loading"}
                style={primaryButton}
              >
                {confirmStatus === "loading" ? "Confirming..." : "Confirm Booking"}
              </button>

              <button
                onClick={onFetchSession}
                disabled={sessionStatus === "loading"}
                style={secondaryButton}
              >
                {sessionStatus === "loading" ? "Loading..." : "Fetch Session"}
              </button>
            </div>
          </div>
        </SectionCard>

        {recentBooking ? (
          <SectionCard title="Recent booking from this client session">
            <div style={{ display: "grid", gap: 8 }}>
              <div><b>Booking ID:</b> {recentBooking.bookingId}</div>
              <div><b>Slot ID:</b> {recentBooking.slotId}</div>
              <div><StatusBadge value={recentBooking.status} /></div>
            </div>
          </SectionCard>
        ) : null}

        {recentConfirmedSession ? (
          <SectionCard title="Recent confirmed session">
            <div style={{ display: "grid", gap: 8 }}>
              <div><b>Session ID:</b> {recentConfirmedSession.sessionId}</div>
              <div><b>Booking ID:</b> {recentConfirmedSession.bookingId}</div>
              <div><b>Room ID:</b> {recentConfirmedSession.roomId}</div>
              <div><StatusBadge value={recentConfirmedSession.sessionStatus} /></div>
            </div>
          </SectionCard>
        ) : null}

        {currentSession ? (
          <SectionCard title="Fetched session">
            <div style={{ display: "grid", gap: 8 }}>
              <div><b>Session ID:</b> {currentSession.sessionId}</div>
              <div><b>Booking ID:</b> {currentSession.bookingId}</div>
              <div><b>Room ID:</b> {currentSession.roomId}</div>
              <div><StatusBadge value={currentSession.sessionStatus} /></div>

              <button
                onClick={() => nav(`/interviews/session/${bookingId}`)}
                style={primaryButton}
              >
                Open Session Page
              </button>
            </div>
          </SectionCard>
        ) : null}
      </div>
    </Shell>
  );
}

const inputStyle = {
  width: "100%",
  padding: 12,
  borderRadius: 12,
  border: "1px solid #e2e8f0",
};

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