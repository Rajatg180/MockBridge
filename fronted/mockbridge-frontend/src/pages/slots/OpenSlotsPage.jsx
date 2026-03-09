import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { bookSlot, fetchOpenSlots } from '../../features/interviews/interviewSlice';
import { Modal } from '../../components/ui/Modal';
import { PageHeader } from '../../components/ui/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { StatusBanner } from '../../components/ui/StatusBanner';
import { useToast } from '../../components/ui/ToastProvider';
import { formatUtcLabel, formatUtcToLocal } from '../../lib/date';

export function OpenSlotsPage() {
  const dispatch = useAppDispatch();
  const { pushToast } = useToast();
  const [searchParams] = useSearchParams();
  const interviewerIdFilter = searchParams.get('interviewerId');

  const userId = useAppSelector((state) => state.auth.user?.userId);
  const { openSlots, openSlotsStatus, mutationStatus, error, workspace } = useAppSelector((state) => state.interviews);
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => {
    if (openSlotsStatus === 'idle') {
      dispatch(fetchOpenSlots());
    }
  }, [dispatch, openSlotsStatus]);

  const filteredSlots = useMemo(() => {
    if (!interviewerIdFilter) return openSlots;
    return openSlots.filter((slot) => slot.interviewerId === interviewerIdFilter);
  }, [openSlots, interviewerIdFilter]);

  async function handleBookSlot() {
    if (!selectedSlot) return;

    try {
      const booking = await dispatch(bookSlot(selectedSlot.id)).unwrap();
      pushToast({
        title: 'Slot booked',
        description: `Booking ID: ${booking.bookingId}`,
        variant: 'success',
      });
      setSelectedSlot(null);
    } catch (message) {
      pushToast({ title: 'Booking failed', description: String(message), variant: 'error' });
    }
  }

  const latestBooking = workspace.bookings[0];

  return (
    <div className="stack-lg">
      <PageHeader
        title="Open slots"
        description="Reads from `/interviews/slots/open` and supports booking through the gateway."
        actions={<button type="button" className="button button-secondary" onClick={() => dispatch(fetchOpenSlots())}>Refresh</button>}
      />

      {interviewerIdFilter ? (
        <StatusBanner variant="info">
          Filtering by interviewerId: <strong>{interviewerIdFilter}</strong>
        </StatusBanner>
      ) : null}

      {error ? <StatusBanner variant="error">{error}</StatusBanner> : null}

      {openSlotsStatus === 'loading' ? (
        <EmptyState title="Loading slots" description="Fetching all currently OPEN availability slots." />
      ) : filteredSlots.length === 0 ? (
        <EmptyState title="No open slots" description="Try again later or remove the interviewer filter." />
      ) : (
        <div className="grid two-columns">
          {filteredSlots.map((slot) => {
            const isOwnSlot = slot.interviewerId === userId;
            return (
              <article key={slot.id} className="card stack">
                <div className="section-title-row">
                  <div>
                    <h3>{formatUtcToLocal(slot.startTimeUtc)}</h3>
                    <p className="muted">to {formatUtcToLocal(slot.endTimeUtc)}</p>
                  </div>
                  <span className="chip">{slot.status}</span>
                </div>
                <div className="detail-list">
                  <div><span>Interviewer ID</span><strong className="break-all">{slot.interviewerId}</strong></div>
                  <div><span>Start UTC</span><strong>{formatUtcLabel(slot.startTimeUtc)}</strong></div>
                  <div><span>End UTC</span><strong>{formatUtcLabel(slot.endTimeUtc)}</strong></div>
                  <div><span>Slot ID</span><strong className="break-all">{slot.id}</strong></div>
                </div>
                {isOwnSlot ? (
                  <StatusBanner variant="warning">You created this slot, so booking it is blocked in the UI.</StatusBanner>
                ) : null}
                <button
                  type="button"
                  className="button button-primary"
                  onClick={() => setSelectedSlot(slot)}
                  disabled={isOwnSlot || mutationStatus === 'loading'}
                >
                  Book slot
                </button>
              </article>
            );
          })}
        </div>
      )}

      {latestBooking ? (
        <article className="card stack">
          <h3>Most recent booking from this browser</h3>
          <div className="detail-list">
            <div><span>Booking ID</span><strong className="break-all">{latestBooking.bookingId}</strong></div>
            <div><span>Slot ID</span><strong className="break-all">{latestBooking.slotId}</strong></div>
            <div><span>Status</span><strong>{latestBooking.status}</strong></div>
          </div>
          <Link className="button button-secondary" to="/workspace">Open workspace tools</Link>
        </article>
      ) : null}

      <Modal
        open={Boolean(selectedSlot)}
        title="Confirm booking"
        description="This sends `POST /interviews/slots/{slotId}/book`."
        onClose={() => setSelectedSlot(null)}
      >
        <div className="stack">
          <p>
            Book slot <strong>{selectedSlot?.id}</strong> from <strong>{formatUtcToLocal(selectedSlot?.startTimeUtc)}</strong> to{' '}
            <strong>{formatUtcToLocal(selectedSlot?.endTimeUtc)}</strong>?
          </p>
          <div className="inline-actions end">
            <button type="button" className="button button-secondary" onClick={() => setSelectedSlot(null)}>
              Cancel
            </button>
            <button type="button" className="button button-primary" onClick={handleBookSlot}>
              Confirm booking
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
