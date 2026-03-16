import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import ErrorBlock from '../components/common/ErrorBlock';

import {
  fetchBookingSession,
  fetchMyBookings,
} from '../features/interview/interviewSlice';
import { addToast } from '../features/ui/uiSlice';
import { utcRangeToLocalLabel } from '../utils/date';
import { getErrorMessage } from '../utils/http';
import {
  buildSessionRoomPath,
  saveActiveSessionRoom,
} from '../utils/sessionRoomStorage';

export default function MyBookingsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const myBookings = useSelector((state) => state.interview.myBookings);
  const sessionLookup = useSelector((state) => state.interview.sessionLookup);

  const [joiningBookingId, setJoiningBookingId] = useState(null);

  useEffect(() => {
    if (myBookings.status === 'idle') {
      dispatch(fetchMyBookings());
    }
  }, [dispatch, myBookings.status]);

  const handleJoinSession = async (booking) => {
    setJoiningBookingId(booking.bookingId);

    try {
      const session = await dispatch(fetchBookingSession(booking.bookingId)).unwrap();
      const sessionContext = {
        bookingId: booking.bookingId,
        source: 'bookings',
        role: 'student',
        counterpartName: booking.interviewerName || 'Interviewer',
        counterpartHeadline: booking.interviewerHeadline || '',
        startTimeUtc: booking.startTimeUtc,
        endTimeUtc: booking.endTimeUtc,
        sessionStatus: session.sessionStatus,
        roomId: session.roomId,
      };

      saveActiveSessionRoom(sessionContext);
      navigate(buildSessionRoomPath(session.roomId), {
        state: {
          sessionContext,
        },
      });
    } catch (submitError) {
      dispatch(
        addToast({
          type: 'error',
          title: 'Session unavailable',
          message: getErrorMessage(
            submitError,
            'The session is not ready yet for this booking.',
          ),
        }),
      );
    } finally {
      setJoiningBookingId(null);
    }
  };

  return (
    <div className="stack-lg">
      <section className="card">
        <div className="card__header">
          <div>
            <p className="eyebrow">My bookings</p>
            <h1>Track booked interviews</h1>
          </div>
          <span className="badge">{myBookings.items.length} total</span>
        </div>

        {myBookings.status === 'loading' ? <Loader label="Loading your bookings..." /> : null}

        {myBookings.status === 'failed' && myBookings.error ? (
          <ErrorBlock
            title="Could not load your bookings"
            message={myBookings.error.message}
            action={
              <button
                type="button"
                className="button button--primary"
                onClick={() => dispatch(fetchMyBookings())}
              >
                Retry
              </button>
            }
          />
        ) : null}

        {myBookings.status !== 'failed' && !myBookings.items.length ? (
          <EmptyState
            title="No bookings yet"
            description="Visit the marketplace and book an open interview slot."
          />
        ) : null}

        <div className="stack">
          {myBookings.items.map((booking) => (
            <div key={booking.bookingId} className="list-card">
              <div>
                <strong>{utcRangeToLocalLabel(booking.startTimeUtc, booking.endTimeUtc)}</strong>
                <p>Hosted by {booking.interviewerName || 'Interviewer'}</p>
                {booking.interviewerHeadline ? <p>{booking.interviewerHeadline}</p> : null}
                <p>Status: {booking.bookingStatus}</p>
              </div>

              {booking.bookingStatus === 'CONFIRMED' ? (
                <button
                  type="button"
                  className="button button--primary"
                  disabled={
                    joiningBookingId === booking.bookingId &&
                    sessionLookup.status === 'loading'
                  }
                  onClick={() => handleJoinSession(booking)}
                >
                  {joiningBookingId === booking.bookingId && sessionLookup.status === 'loading'
                    ? 'Joining...'
                    : 'Join session'}
                </button>
              ) : (
                <span className="badge badge--muted">{booking.bookingStatus}</span>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
