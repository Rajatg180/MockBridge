import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { fetchSession } from "../../features/interviews/interviewSlice";

export function SessionPage() {
  const { bookingId } = useParams();
  const dispatch = useAppDispatch();

  const { workspace, sessionStatus } = useAppSelector(
    (state) => state.interviews,
  );

  const session = workspace.sessions.find((s) => s.bookingId === bookingId);

  useEffect(() => {
    if (!session) {
      dispatch(fetchSession(bookingId));
    }
  }, [bookingId, dispatch]);

  if (sessionStatus === "loading") {
    return <div className="card">Loading session...</div>;
  }

  if (!session) {
    return <div className="card subtle">Session not found.</div>;
  }

  return (
    <div className="stack">
      <h2>Interview Session</h2>

      <div className="card">
        <p>
          <strong>Session ID:</strong> {session.sessionId}
        </p>
        <p>
          <strong>Room:</strong> {session.roomId}
        </p>
        <p>
          <strong>Status:</strong> {session.status}
        </p>
      </div>

      <button
        onClick={() =>
          window.open(`https://meet.jit.si/${session.roomId}`, "_blank")
        }
        className="button button-primary"
      >
        Join Meeting
      </button>
    </div>
  );
}
