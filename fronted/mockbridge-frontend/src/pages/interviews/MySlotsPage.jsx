import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  fetchMySlots,
  cancelSlot,
  deleteSlot,
} from "../../features/interviews/interviewSlice";

export function MySlotsPage() {
  const dispatch = useAppDispatch();
  const { mySlots, mySlotsStatus, error, mutationStatus } = useAppSelector(
    (state) => state.interviews,
  );

  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    dispatch(fetchMySlots());
  }, [dispatch]);

  const filteredSlots = useMemo(() => {
    if (statusFilter === "ALL") return mySlots;
    return mySlots.filter((slot) => slot.status === statusFilter);
  }, [mySlots, statusFilter]);

  async function handleCancelSlot(slotId) {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this slot?",
    );
    if (!confirmed) return;

    try {
      await dispatch(cancelSlot(slotId)).unwrap();
    } catch (_) {
    }
  }

  async function handleDeleteSlot(slotId) {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this slot?",
    );
    if (!confirmed) return;

    try {
      await dispatch(deleteSlot(slotId)).unwrap();
    } catch (_) {
    }
  }

  return (
    <div className="stack-lg">
      <div className="stack">
        <h2>My Slots</h2>
        <p className="muted">View all slots you created as an interviewer.</p>
      </div>

      <div className="card stack">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["ALL", "OPEN", "BOOKED", "CANCELLED"].map((value) => (
            <button
              key={value}
              type="button"
              className={`button ${
                statusFilter === value ? "button-primary" : "button-secondary"
              }`}
              onClick={() => setStatusFilter(value)}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      {mySlotsStatus === "loading" ? (
        <div className="card">Loading your slots...</div>
      ) : null}

      {error && (mySlotsStatus === "failed" || mutationStatus === "failed") ? (
        <div className="card subtle">{error}</div>
      ) : null}

      {mySlotsStatus !== "loading" && filteredSlots.length === 0 ? (
        <div className="card subtle">No slots found for this filter.</div>
      ) : null}

      <div className="stack">
        {filteredSlots.map((slot) => (
          <article key={slot.id} className="card stack">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 16,
                flexWrap: "wrap",
              }}
            >
              <div className="stack" style={{ gap: 6 }}>
                <strong className="break-all">{slot.id}</strong>
                <p className="muted">
                  {new Date(slot.startTimeUtc + "Z").toLocaleString()} —{" "}
                  {new Date(slot.endTimeUtc + "Z").toLocaleString()}
                </p>
                <p className="muted">Status: {slot.status}</p>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                {slot.status === "BOOKED" ? (
                  <>
                    <Link
                      to="/booking-requests"
                      className="button button-primary"
                    >
                      View booking requests
                    </Link>

                    <Link to="/workspace" className="button button-secondary">
                      Open workspace
                    </Link>
                  </>
                ) : null}

                {slot.status === "OPEN" ? (
                  <Link to="/slots/open" className="button button-secondary">
                    View public slots
                  </Link>
                ) : null}

                {slot.status === "BOOKED" ? (
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => handleCancelSlot(slot.id)}
                    disabled={mutationStatus === "loading"}
                  >
                    {mutationStatus === "loading"
                      ? "Cancelling..."
                      : "Cancel slot"}
                  </button>
                ) : null}

                {slot.status === "OPEN" ? (
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => handleDeleteSlot(slot.id)}
                    disabled={mutationStatus === "loading"}
                  >
                    {mutationStatus === "loading"
                      ? "Deleting..."
                      : "Delete slot"}
                  </button>
                ) : null}

                {slot.status === "CANCELLED" ? (
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => handleDeleteSlot(slot.id)}
                    disabled={mutationStatus === "loading"}
                  >
                    {mutationStatus === "loading"
                      ? "Deleting..."
                      : "Delete slot"}
                  </button>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}