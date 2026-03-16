import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import ErrorBlock from '../components/common/ErrorBlock';
import ConfirmDialog from '../components/common/ConfirmDialog';

import {
  bookMarketplaceSlot,
  fetchMarketplace,
  fetchMyBookings,
} from '../features/interview/interviewSlice';
import { addToast } from '../features/ui/uiSlice';
import { getErrorMessage } from '../utils/http';
import { utcRangeToLocalLabel } from '../utils/date';

export default function InterviewMarketplacePage() {
  const dispatch = useDispatch();

  const marketplace = useSelector((state) => state.interview.marketplace);
  const mutation = useSelector((state) => state.interview.mutation);

  const [searchInput, setSearchInput] = useState('');
  const [slotToBook, setSlotToBook] = useState(null);

  useEffect(() => {
    if (marketplace.status === 'idle') {
      dispatch(fetchMarketplace(''));
    }
  }, [dispatch, marketplace.status]);

  const totalSlots = useMemo(
    () => marketplace.items.reduce((count, item) => count + item.slots.length, 0),
    [marketplace.items],
  );

  const handleSearch = (event) => {
    event.preventDefault();
    dispatch(fetchMarketplace(searchInput));
  };

  const handleBookSlot = async () => {
    if (!slotToBook) {
      return;
    }

    try {
      await dispatch(bookMarketplaceSlot(slotToBook.id)).unwrap();
      await dispatch(fetchMarketplace(marketplace.lastQuery));
      dispatch(fetchMyBookings());

      dispatch(
        addToast({
          type: 'success',
          title: 'Interview booked',
          message: 'Your booking request has been created.',
        }),
      );
    } catch (submitError) {
      dispatch(
        addToast({
          type: 'error',
          title: 'Booking failed',
          message: getErrorMessage(submitError, 'Unable to book this slot.'),
        }),
      );
    } finally {
      setSlotToBook(null);
    }
  };

  return (
    <div className="stack-lg">
      <section className="card">
        <div className="card__header">
          <div>
            <p className="eyebrow">Marketplace</p>
            <h1>Search interviewers and open slots</h1>
          </div>
          <span className="badge">{totalSlots} open slots</span>
        </div>

        <form className="toolbar" onSubmit={handleSearch}>
          <label className="field toolbar__search">
            <span className="sr-only">Search interviewers</span>
            <input
              className="input"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by skill, name, headline, or bio"
            />
          </label>

          <button
            type="submit"
            className="button button--primary"
            disabled={marketplace.status === 'loading'}
          >
            {marketplace.status === 'loading' ? 'Searching...' : 'Search'}
          </button>

          <button
            type="button"
            className="button button--ghost"
            onClick={() => {
              setSearchInput('');
              dispatch(fetchMarketplace(''));
            }}
          >
            Reset
          </button>
        </form>
      </section>

      {marketplace.status === 'loading' ? <Loader label="Loading interviewers..." /> : null}

      {marketplace.status === 'failed' && marketplace.error ? (
        <ErrorBlock
          title="Could not load interview marketplace"
          message={marketplace.error.message}
          action={
            <button
              type="button"
              className="button button--primary"
              onClick={() => dispatch(fetchMarketplace(marketplace.lastQuery))}
            >
              Retry
            </button>
          }
        />
      ) : null}

      {marketplace.status !== 'failed' && marketplace.items.length === 0 ? (
        <EmptyState
          title="No interviewers found"
          description={
            marketplace.lastQuery
              ? 'Try a broader keyword. Search now includes interviewer profiles even if they do not currently have open slots.'
              : 'There are no interviewers or open slots available right now.'
          }
        />
      ) : null}

      <div className="card-grid">
        {marketplace.items.map((item) => (
          <article className="card" key={item.userId}>
            <div className="card__header">
              <div>
                <h2>{item.fullName}</h2>
                <p>{item.headline || 'Mock interview expert'}</p>
              </div>
              <span className="badge">{item.slots.length} slots</span>
            </div>

            <div className="stack">
              <div className="meta-row">
                <span>{item.yearsOfExperience} years experience</span>
                <span>Rating {Number(item.averageRating || 0).toFixed(2)}</span>
              </div>

              {item.bio ? <p className="muted">{item.bio}</p> : null}

              {(item.skills || []).length ? (
                <div className="tag-row">
                  {item.skills.map((skill) => (
                    <span key={`${item.userId}-${skill.skillName}`} className="tag">
                      {skill.skillName} · {skill.proficiency}
                    </span>
                  ))}
                </div>
              ) : null}

              {item.slots.length ? (
                <div className="slot-list">
                  {item.slots.map((slot) => (
                    <button
                      type="button"
                      key={slot.id}
                      className="slot-button"
                      onClick={() => setSlotToBook(slot)}
                    >
                      <div>
                        <strong>{utcRangeToLocalLabel(slot.startTimeUtc, slot.endTimeUtc)}</strong>
                        <p>Hosted by {slot.interviewerName || item.fullName}</p>
                        {slot.interviewerHeadline ? <p>{slot.interviewerHeadline}</p> : null}
                      </div>
                      <span>Book</span>
                    </button>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No open slots right now"
                  description="This interviewer matches your search, but has not published an open slot yet."
                />
              )}
            </div>
          </article>
        ))}
      </div>

      <ConfirmDialog
        open={Boolean(slotToBook)}
        title="Book interview slot?"
        description={
          slotToBook
            ? `Create a booking request with ${slotToBook.interviewerName || 'this interviewer'} for ${utcRangeToLocalLabel(
                slotToBook.startTimeUtc,
                slotToBook.endTimeUtc,
              )}?`
            : ''
        }
        confirmLabel="Book slot"
        tone="primary"
        isLoading={mutation.status === 'loading' && mutation.kind === 'book-slot'}
        onConfirm={handleBookSlot}
        onClose={() => setSlotToBook(null)}
      />
    </div>
  );
}