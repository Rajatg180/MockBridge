import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import ErrorBlock from '../components/common/ErrorBlock';
import ConfirmDialog from '../components/common/ConfirmDialog';

import {
  cancelAvailabilitySlot,
  confirmIncomingBooking,
  createAvailabilitySlot,
  deleteAvailabilitySlot,
  fetchBookingSession,
  fetchIncomingBookingRequests,
  fetchMySlots,
} from '../features/interview/interviewSlice';
import { addToast } from '../features/ui/uiSlice';
import { getErrorMessage } from '../utils/http';
import {
  getMinLocalDateTimeInput,
  localInputToUtcNaiveString,
  utcDateTimeToLocalLabel,
  utcRangeToLocalLabel,
} from '../utils/date';
import {
  buildSessionRoomPath,
  saveActiveSessionRoom,
} from '../utils/sessionRoomStorage';

const initialForm = {
  startLocal: '',
  endLocal: '',
};

export default function MySlotsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const mySlots = useSelector((state) => state.interview.mySlots);
  const incomingRequests = useSelector((state) => state.interview.incomingRequests);
  const mutation = useSelector((state) => state.interview.mutation);
  const sessionLookup = useSelector((state) => state.interview.sessionLookup);

  const [form, setForm] = useState(initialForm);
  const [requestFilter, setRequestFilter] = useState('');
  const [slotAction, setSlotAction] = useState(null);
  const [sessionReady, setSessionReady] = useState(null);
  const [joiningBookingId, setJoiningBookingId] = useState(null);

  useEffect(() => {
    if (mySlots.status === 'idle') {
      dispatch(fetchMySlots());
    }
  }, [dispatch, mySlots.status]);

  useEffect(() => {
    dispatch(fetchIncomingBookingRequests(requestFilter));
  }, [dispatch, requestFilter]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleCreateSlot = async (event) => {
    event.preventDefault();

    try {
      await dispatch(
        createAvailabilitySlot({
          startTimeUtc: localInputToUtcNaiveString(form.startLocal),
          endTimeUtc: localInputToUtcNaiveString(form.endLocal),
        }),
      ).unwrap();

      await dispatch(fetchMySlots());

      dispatch(
        addToast({
          type: 'success',
          title: 'Slot created',
          message: 'Your availability slot is now open for bookings.',
        }),
      );

      setForm(initialForm);
    } catch (submitError) {
      dispatch(
        addToast({
          type: 'error',
          title: 'Unable to create slot',
          message: getErrorMessage(submitError, 'Please check your slot times.'),
        }),
      );
    }
  };

  const handleSlotAction = async () => {
    if (!slotAction) {
      return;
    }

    try {
      if (slotAction.mode === 'cancel') {
        await dispatch(cancelAvailabilitySlot(slotAction.slot.id)).unwrap();
        dispatch(
          addToast({
            type: 'success',
            title: 'Slot cancelled',
            message: 'The slot has been cancelled.',
          }),
        );
      } else {
        await dispatch(deleteAvailabilitySlot(slotAction.slot.id)).unwrap();
        dispatch(
          addToast({
            type: 'success',
            title: 'Slot deleted',
            message: 'The slot was removed permanently.',
          }),
        );
      }

      await dispatch(fetchMySlots());
      await dispatch(fetchIncomingBookingRequests(requestFilter));
    } catch (submitError) {
      dispatch(
        addToast({
          type: 'error',
          title: 'Slot action failed',
          message: getErrorMessage(submitError, 'Unable to update slot state.'),
        }),
      );
    } finally {
      setSlotAction(null);
    }
  };

  const navigateToSessionRoom = (requestItem, session) => {
    const sessionContext = {
      bookingId: requestItem.bookingId,
      source: 'slots',
      role: 'interviewer',
      counterpartName: requestItem.studentName || 'Candidate',
      counterpartHeadline: requestItem.studentHeadline || '',
      startTimeUtc: requestItem.startTimeUtc,
      endTimeUtc: requestItem.endTimeUtc,
      sessionStatus: session.sessionStatus,
      roomId: session.roomId,
    };

    saveActiveSessionRoom(sessionContext);
    navigate(buildSessionRoomPath(session.roomId), {
      state: {
        sessionContext,
      },
    });
  };

  const handleConfirmBooking = async (requestItem) => {
    try {
      const session = await dispatch(confirmIncomingBooking(requestItem.bookingId)).unwrap();
      await dispatch(fetchIncomingBookingRequests(requestFilter));

      setSessionReady({
        requestItem,
        session,
      });

      dispatch(
        addToast({
          type: 'success',
          title: 'Booking confirmed',
          message: 'The interview session is ready.',
        }),
      );
    } catch (submitError) {
      dispatch(
        addToast({
          type: 'error',
          title: 'Confirmation failed',
          message: getErrorMessage(submitError, 'Unable to confirm this booking.'),
        }),
      );
    }
  };

  const handleJoinSession = async (requestItem) => {
    setJoiningBookingId(requestItem.bookingId);

    try {
      const session = await dispatch(fetchBookingSession(requestItem.bookingId)).unwrap();
      navigateToSessionRoom(requestItem, session);
    } catch (submitError) {
      dispatch(
        addToast({
          type: 'error',
          title: 'Session unavailable',
          message: getErrorMessage(submitError, 'This session is not available right now.'),
        }),
      );
    } finally {
      setJoiningBookingId(null);
    }
  };

  return (
    <div className="stack-lg">
      <section className="content-grid">
        <article className="card">
          <div className="card__header">
            <div>
              <p className="eyebrow">Availability</p>
              <h1>Create a new slot</h1>
            </div>
          </div>

          <form className="stack" onSubmit={handleCreateSlot}>
            <label className="field">
              <span>Start time</span>
              <input
                className="input"
                type="datetime-local"
                name="startLocal"
                value={form.startLocal}
                onChange={handleChange}
                min={getMinLocalDateTimeInput()}
                required
              />
            </label>

            <label className="field">
              <span>End time</span>
              <input
                className="input"
                type="datetime-local"
                name="endLocal"
                value={form.endLocal}
                onChange={handleChange}
                min={form.startLocal || getMinLocalDateTimeInput()}
                required
              />
            </label>

            <button
              type="submit"
              className="button button--primary"
              disabled={mutation.status === 'loading' && mutation.kind === 'create-slot'}
            >
              {mutation.status === 'loading' && mutation.kind === 'create-slot'
                ? 'Creating slot...'
                : 'Create slot'}
            </button>
          </form>
        </article>

        <article className="card">
          <div className="card__header">
            <div>
              <p className="eyebrow">My slots</p>
              <h2>Manage existing availability</h2>
            </div>
            <span className="badge">{mySlots.items.length} total</span>
          </div>

          {mySlots.status === 'loading' ? <Loader label="Loading your slots..." /> : null}

          {mySlots.status === 'failed' && mySlots.error ? (
            <ErrorBlock
              title="Could not load your slots"
              message={mySlots.error.message}
              action={
                <button
                  type="button"
                  className="button button--primary"
                  onClick={() => dispatch(fetchMySlots())}
                >
                  Retry
                </button>
              }
            />
          ) : null}

          {mySlots.status !== 'failed' && !mySlots.items.length ? (
            <EmptyState
              title="No slots yet"
              description="Create your first availability slot to start receiving booking requests."
            />
          ) : null}

          <div className="stack">
            {mySlots.items.map((slot) => (
              <div key={slot.id} className="list-card">
                <div>
                  <strong>{utcRangeToLocalLabel(slot.startTimeUtc, slot.endTimeUtc)}</strong>
                  <p>Created by you</p>
                  <p>Status: {slot.status}</p>
                </div>
                <div className="button-row">
                  {slot.status === 'OPEN' || slot.status === 'BOOKED' ? (
                    <button
                      type="button"
                      className="button button--ghost"
                      onClick={() => setSlotAction({ mode: 'cancel', slot })}
                    >
                      Cancel
                    </button>
                  ) : null}

                  {slot.status === 'OPEN' || slot.status === 'CANCELLED' ? (
                    <button
                      type="button"
                      className="button button--danger"
                      onClick={() => setSlotAction({ mode: 'delete', slot })}
                    >
                      Delete
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="card">
        <div className="card__header">
          <div>
            <p className="eyebrow">Incoming requests</p>
            <h2>Review booking requests</h2>
          </div>

          <label className="field field--inline">
            <span>Status</span>
            <select
              className="input"
              value={requestFilter}
              onChange={(event) => setRequestFilter(event.target.value)}
            >
              <option value="">ALL</option>
              <option value="PENDING">PENDING</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>
          </label>
        </div>

        {incomingRequests.status === 'loading' ? (
          <Loader label="Loading booking requests..." />
        ) : null}

        {incomingRequests.status === 'failed' && incomingRequests.error ? (
          <ErrorBlock
            title="Could not load booking requests"
            message={incomingRequests.error.message}
            action={
              <button
                type="button"
                className="button button--primary"
                onClick={() => dispatch(fetchIncomingBookingRequests(requestFilter))}
              >
                Retry
              </button>
            }
          />
        ) : null}

        {incomingRequests.status !== 'failed' && !incomingRequests.items.length ? (
          <EmptyState
            title="No requests for this filter"
            description="Change the status filter or wait for new bookings."
          />
        ) : null}

        <div className="stack">
          {incomingRequests.items.map((item) => (
            <div key={item.bookingId} className="list-card">
              <div>
                <strong>{utcRangeToLocalLabel(item.startTimeUtc, item.endTimeUtc)}</strong>
                <p>Requested by {item.studentName || 'Candidate'}</p>
                {item.studentHeadline ? <p>{item.studentHeadline}</p> : null}
                <p>
                  Booking status: {item.bookingStatus} · Slot status: {item.slotStatus}
                </p>
                <p>Requested on {utcDateTimeToLocalLabel(item.createdAt)}</p>
              </div>

              <div className="button-row">
                {item.bookingStatus === 'PENDING' ? (
                  <button
                    type="button"
                    className="button button--primary"
                    disabled={
                      mutation.status === 'loading' && mutation.kind === 'confirm-booking'
                    }
                    onClick={() => handleConfirmBooking(item)}
                  >
                    {mutation.status === 'loading' && mutation.kind === 'confirm-booking'
                      ? 'Confirming...'
                      : 'Confirm booking'}
                  </button>
                ) : null}

                {item.bookingStatus === 'CONFIRMED' ? (
                  <button
                    type="button"
                    className="button button--primary"
                    disabled={
                      joiningBookingId === item.bookingId && sessionLookup.status === 'loading'
                    }
                    onClick={() => handleJoinSession(item)}
                  >
                    {joiningBookingId === item.bookingId && sessionLookup.status === 'loading'
                      ? 'Joining...'
                      : 'Join session'}
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </section>

      <ConfirmDialog
        open={Boolean(slotAction)}
        title={
          slotAction?.mode === 'delete' ? 'Delete slot permanently?' : 'Cancel slot?'
        }
        description={
          slotAction
            ? slotAction.mode === 'delete'
              ? 'Only OPEN or CANCELLED slots should be deleted. BOOKED slots should be cancelled instead.'
              : 'Cancelling a BOOKED slot preserves history and cancels the booking.'
            : ''
        }
        confirmLabel={slotAction?.mode === 'delete' ? 'Delete slot' : 'Cancel slot'}
        isLoading={
          mutation.status === 'loading' &&
          (mutation.kind === 'cancel-slot' || mutation.kind === 'delete-slot')
        }
        onConfirm={handleSlotAction}
        onClose={() => setSlotAction(null)}
      />

      <ConfirmDialog
        open={Boolean(sessionReady)}
        title="Booking confirmed"
        description={
          sessionReady
            ? `The interview with ${sessionReady.requestItem.studentName || 'the candidate'} is ready. Join now?`
            : ''
        }
        confirmLabel="Join session"
        cancelLabel="Stay here"
        tone="primary"
        onConfirm={() => {
          if (!sessionReady) {
            return;
          }

          navigateToSessionRoom(sessionReady.requestItem, sessionReady.session);
          setSessionReady(null);
        }}
        onClose={() => setSessionReady(null)}
      />
    </div>
  );
}