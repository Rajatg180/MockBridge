import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import Shell from "../ui/Shell";
import SectionCard from "../ui/SectionCard";
import LoadingBlock from "../ui/LoadingBlock";
import EmptyState from "../ui/EmptyState";
import StatusBadge from "../ui/StatusBadge";
import { fetchSessionByBookingId } from "../features/interview/interviewSlice";
import { toastAdded } from "../features/ui/uiSlice";

export default function SessionRoom() {
  const { bookingId } = useParams();
  const dispatch = useDispatch();

  const session = useSelector((s) => s.interview.sessionsByBookingId[bookingId]);
  const sessionStatus = useSelector((s) => s.interview.sessionStatus);

  useEffect(() => {
    if (bookingId && !session) {
      dispatch(fetchSessionByBookingId(bookingId));
    }
  }, [dispatch, bookingId, session]);

  const openJitsi = () => {
    if (!session?.roomId) return;
    const url = `https://meet.jit.si/${session.roomId}`;
    window.open(url, "_blank", "noopener,noreferrer");
    dispatch(
      toastAdded({
        type: "success",
        title: "Opening session",
        message: "Jitsi room opened in a new tab.",
      })
    );
  };

  return (
    <Shell title="Session Room" subtitle={`Booking ID: ${bookingId}`}>
      {sessionStatus === "loading" && !session ? (
        <LoadingBlock label="Loading session..." />
      ) : !session ? (
        <EmptyState
          title="Session not available"
          message="Either the booking is not confirmed yet, or you are not allowed to access it."
        />
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          <SectionCard title="Session details">
            <div style={{ display: "grid", gap: 8 }}>
              <div><b>Session ID:</b> {session.sessionId}</div>
              <div><b>Booking ID:</b> {session.bookingId}</div>
              <div><b>Room ID:</b> {session.roomId}</div>
              <div><StatusBadge value={session.sessionStatus} /></div>
            </div>
          </SectionCard>

          <SectionCard title="Join interview">
            <div style={{ color: "#475569", marginBottom: 12 }}>
              Your backend returns the Jitsi room id. This page opens the room on meet.jit.si.
            </div>

            <button onClick={openJitsi} style={primaryButton}>
              Join Jitsi Session
            </button>
          </SectionCard>
        </div>
      )}
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