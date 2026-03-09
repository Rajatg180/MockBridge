import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { confirmBooking, fetchIncomingBookingRequests } from '../../features/interviews/interviewSlice';
import { Modal } from '../../components/ui/Modal';
import { PageHeader } from '../../components/ui/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { StatusBanner } from '../../components/ui/StatusBanner';
import { SelectField } from '../../components/ui/FormFields';
import { useToast } from '../../components/ui/ToastProvider';
import { formatUtcLabel, formatUtcToLocal } from '../../lib/date';

const statusOptions = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'ALL', label: 'All statuses' },
];

export function BookingRequestsPage() {
  const dispatch = useAppDispatch();
  const { pushToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get('status') || 'PENDING';

  const { bookingRequests, bookingRequestsStatus, mutationStatus, error } = useAppSelector((state) => state.interviews);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    dispatch(fetchIncomingBookingRequests(statusFilter));
  }, [dispatch, statusFilter]);

  const groupedRequests = useMemo(() => {
    return bookingRequests;
  }, [bookingRequests]);

  async function handleConfirmBooking() {
    if (!selectedRequest?.bookingId) return;

    try {
      const session = await dispatch(confirmBooking(selectedRequest.bookingId)).unwrap();
      pushToast({
        title: 'Booking confirmed',
        description: `Room ID: ${session.roomId}`,
        variant: 'success',
      });
      setSelectedRequest(null);
      dispatch(fetchIncomingBookingRequests(statusFilter));
    } catch (message) {
      pushToast({ title: 'Confirm failed', description: String(message), variant: 'error' });
    }
  }

  function handleStatusChange(event) {
    const nextStatus = event.target.value;
    setSearchParams(nextStatus === 'PENDING' ? {} : { status: nextStatus });
  }

  return (
    <div className="stack-lg">
      <PageHeader
        title="Booking requests"
        description="Interviewer-side inbox for bookings made on slots you created. This page reads from `GET /interviews/me/booking-requests`."
        actions={
          <button
            type="button"
            className="button button-secondary"
            onClick={() => dispatch(fetchIncomingBookingRequests(statusFilter))}
          >
            Refresh
          </button>
        }
      />

      <section className="card stack">
        <SelectField
          label="Status filter"
          value={statusFilter}
          onChange={handleStatusChange}
          options={statusOptions}
          hint="Pending is the default because it is the main confirm-booking workflow."
        />
      </section>

      {error ? <StatusBanner variant="error">{error}</StatusBanner> : null}

      {bookingRequestsStatus === 'loading' ? (
        <EmptyState title="Loading booking requests" description="Fetching requests for slots owned by you." />
      ) : groupedRequests.length === 0 ? (
        <EmptyState
          title="No booking requests found"
          description="Once another user books one of your slots, the request will appear here."
          action={<Link className="button button-primary" to="/slots/create">Create a slot</Link>}
        />
      ) : (
        <div className="grid two-columns">
          {groupedRequests.map((request) => {
            const canConfirm = request.bookingStatus === 'PENDING';

            return (
              <article key={request.bookingId} className="card stack">
                <div className="section-title-row">
                  <div>
                    <h3>{formatUtcToLocal(request.startTimeUtc)}</h3>
                    <p className="muted">to {formatUtcToLocal(request.endTimeUtc)}</p>
                  </div>
                  <span className="chip">{request.bookingStatus}</span>
                </div>

                <div className="detail-list">
                  <div><span>Student ID</span><strong className="break-all">{request.studentId}</strong></div>
                  <div><span>Slot ID</span><strong className="break-all">{request.slotId}</strong></div>
                  <div><span>Booking ID</span><strong className="break-all">{request.bookingId}</strong></div>
                  <div><span>Slot status</span><strong>{request.slotStatus}</strong></div>
                  <div><span>Start UTC</span><strong>{formatUtcLabel(request.startTimeUtc)}</strong></div>
                  <div><span>End UTC</span><strong>{formatUtcLabel(request.endTimeUtc)}</strong></div>
                  <div><span>Requested at</span><strong>{formatUtcToLocal(request.createdAt)}</strong></div>
                </div>

                {canConfirm ? (
                  <button
                    type="button"
                    className="button button-primary"
                    onClick={() => setSelectedRequest(request)}
                    disabled={mutationStatus === 'loading'}
                  >
                    Confirm booking
                  </button>
                ) : (
                  <StatusBanner variant="info">This request is already {request.bookingStatus.toLowerCase()}.</StatusBanner>
                )}
              </article>
            );
          })}
        </div>
      )}

      <Modal
        open={Boolean(selectedRequest)}
        title="Confirm booking request"
        description="This sends `POST /interviews/bookings/{bookingId}/confirm` and creates a session room."
        onClose={() => setSelectedRequest(null)}
      >
        <div className="stack">
          <p>
            Confirm booking <strong>{selectedRequest?.bookingId}</strong> for slot <strong>{selectedRequest?.slotId}</strong>?
          </p>
          <div className="detail-list">
            <div><span>Student ID</span><strong className="break-all">{selectedRequest?.studentId}</strong></div>
            <div><span>Local time</span><strong>{formatUtcToLocal(selectedRequest?.startTimeUtc)} to {formatUtcToLocal(selectedRequest?.endTimeUtc)}</strong></div>
          </div>
          <div className="inline-actions end">
            <button type="button" className="button button-secondary" onClick={() => setSelectedRequest(null)}>
              Cancel
            </button>
            <button type="button" className="button button-primary" onClick={handleConfirmBooking}>
              Confirm now
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
