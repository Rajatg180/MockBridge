import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  clearWorkspace,
  confirmBooking,
  fetchSession,
} from "../../features/interviews/interviewSlice";
import { PageHeader } from "../../components/ui/PageHeader";
import { StatusBanner } from "../../components/ui/StatusBanner";
import { EmptyState } from "../../components/ui/EmptyState";
import { TextField } from "../../components/ui/FormFields";
import { useToast } from "../../components/ui/ToastProvider";

export function WorkspacePage() {
  const dispatch = useAppDispatch();
  const { pushToast } = useToast();
  const { workspace, mutationStatus, sessionStatus, error } = useAppSelector(
    (state) => state.interviews,
  );

  const [confirmBookingId, setConfirmBookingId] = useState(
    workspace.bookings[0]?.bookingId || "",
  );
  const [sessionBookingId, setSessionBookingId] = useState(
    workspace.bookings[0]?.bookingId || "",
  );

  async function handleConfirmBooking(event) {
    event.preventDefault();
    if (!confirmBookingId.trim()) return;

    try {
      const session = await dispatch(
        confirmBooking(confirmBookingId.trim()),
      ).unwrap();
      pushToast({
        title: "Booking confirmed",
        description: `Room ID: ${session.roomId}`,
        variant: "success",
      });
    } catch (message) {
      pushToast({
        title: "Confirm failed",
        description: String(message),
        variant: "error",
      });
    }
  }

  async function handleFetchSession(event) {
    event.preventDefault();
    if (!sessionBookingId.trim()) return;

    try {
      const session = await dispatch(
        fetchSession(sessionBookingId.trim()),
      ).unwrap();
      pushToast({
        title: "Session fetched",
        description: `Room ID: ${session.roomId}`,
        variant: "success",
      });
    } catch (message) {
      pushToast({
        title: "Fetch session failed",
        description: String(message),
        variant: "error",
      });
    }
  }

  return (
    <div className="stack-lg">
      <PageHeader
        title="Workspace tools"
        description="This page compensates for missing list endpoints by persisting recent slot, booking, and session activity locally."
        actions={
          <button
            type="button"
            className="button button-secondary"
            onClick={() => dispatch(clearWorkspace())}
          >
            Clear local workspace
          </button>
        }
      />

      {error ? <StatusBanner variant="error">{error}</StatusBanner> : null}

      <section className="grid two-columns">
        <article className="card stack">
          <div>
            <h3>Confirm booking</h3>
            <p className="muted">
              For interviewer flow: `POST /interviews/bookings/{"{bookingId}"}
              /confirm`.
            </p>
          </div>
          <form className="stack" onSubmit={handleConfirmBooking}>
            <TextField
              label="Booking ID"
              value={confirmBookingId}
              onChange={(event) => setConfirmBookingId(event.target.value)}
              placeholder="Paste booking UUID"
            />
            <button
              type="submit"
              className="button button-primary"
              disabled={mutationStatus === "loading"}
            >
              {mutationStatus === "loading"
                ? "Confirming..."
                : "Confirm booking"}
            </button>
          </form>
        </article>

        <article className="card stack">
          <div>
            <h3>Get session</h3>
            <p className="muted">
              For participant flow: `GET /interviews/bookings/{"{bookingId}"}
              /session`.
            </p>
          </div>
          <form className="stack" onSubmit={handleFetchSession}>
            <TextField
              label="Booking ID"
              value={sessionBookingId}
              onChange={(event) => setSessionBookingId(event.target.value)}
              placeholder="Paste booking UUID"
            />
            <button
              type="submit"
              className="button button-primary"
              disabled={sessionStatus === "loading"}
            >
              {sessionStatus === "loading" ? "Fetching..." : "Get session"}
            </button>
          </form>
        </article>
      </section>

      <section className="grid two-columns">
        <article className="card stack">
          <div>
            <h3>Recent created slots</h3>
            <p className="muted">Last 10 slots created from this browser.</p>
          </div>
          {workspace.createdSlots.length ? (
            workspace.createdSlots.map((slot) => (
              <div key={slot.id} className="list-item">
                <div>
                  <strong className="break-all">{slot.id}</strong>
                  <p className="muted">
                    {slot.startTimeUtc} to {slot.endTimeUtc} UTC
                  </p>
                </div>
                <span className="chip">{slot.status}</span>
              </div>
            ))
          ) : (
            <EmptyState
              title="No slot history"
              description="Create a slot to see it here."
            />
          )}
        </article>

        <article className="card stack">
          <div>
            <h3>Recent bookings</h3>
            <p className="muted">
              Booking IDs returned from successful book actions.
            </p>
          </div>
          {workspace.bookings.length ? (
            workspace.bookings.map((booking) => (
              <div key={booking.bookingId} className="list-item">
                <div>
                  <strong className="break-all">{booking.bookingId}</strong>
                  <p className="muted">Slot: {booking.slotId}</p>
                </div>
                <span className="chip">{booking.status}</span>
              </div>
            ))
          ) : (
            <EmptyState
              title="No booking history"
              description="Book a slot to get the booking ID here."
            />
          )}
        </article>
      </section>

      <section className="card stack">
        <div>
          <h3>Recent sessions</h3>
          <p className="muted">
            Sessions returned by confirm and get session actions.
          </p>
        </div>
        {workspace.sessions.length ? (
          workspace.sessions.map((session) => (
            <div key={session.sessionId} className="list-item">
              <div>
                <strong>{session.roomId}</strong>
                <p className="muted">Booking: {session.bookingId}</p>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <span className="chip">{session.sessionStatus}</span>

                <a
                  href={`/session/${session.bookingId}`}
                  className="button button-primary"
                >
                  Join
                </a>
              </div>
            </div>
          ))
        ) : (
          <EmptyState
            title="No session history"
            description="Confirm a booking or fetch a session to populate this area."
          />
        )}
      </section>
    </div>
  );
}
