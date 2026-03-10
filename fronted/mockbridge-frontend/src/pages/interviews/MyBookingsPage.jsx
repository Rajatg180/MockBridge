import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyBookings } from "../../features/interviews/interviewSlice";
import { Link } from "react-router-dom";

export const MyBookingsPage = () => {
  const dispatch = useDispatch();

  const { myBookings, myBookingsStatus } = useSelector(
    (state) => state.interviews
  );

  useEffect(() => {
    dispatch(fetchMyBookings());
  }, [dispatch]);

  if (myBookingsStatus === "loading") {
    return <div className="card">Loading bookings...</div>;
  }

  return (
    <div className="stack">
      <h2>My Bookings</h2>

      {myBookings.length === 0 && (
        <div className="card subtle">No bookings yet.</div>
      )}

      {myBookings.map((b) => (
        <div key={b.bookingId} className="card">
          <p><strong>Booking ID:</strong> {b.bookingId}</p>
          <p><strong>Interviewer:</strong> {b.interviewerId}</p>

          <p>
            <strong>Time:</strong>{" "}
            {new Date(b.startTimeUtc + "Z").toLocaleString()} -{" "}
            {new Date(b.endTimeUtc + "Z").toLocaleString()}
          </p>

          <p>
            <strong>Status:</strong> {b.bookingStatus}
          </p>

          {b.bookingStatus === "CONFIRMED" && (
            <Link
              to={`/session/${b.bookingId}`}
              className="button"
            >
              Join Interview
            </Link>
          )}
        </div>
      ))}
    </div>
  );
};