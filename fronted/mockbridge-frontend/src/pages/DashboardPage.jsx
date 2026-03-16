import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { fetchMyProfile } from '../features/profile/profileSlice';
import {
  fetchIncomingBookingRequests,
  fetchMyBookings,
  fetchMySlots,
} from '../features/interview/interviewSlice';
import Loader from '../components/common/Loader';
import ErrorBlock from '../components/common/ErrorBlock';

function StatCard({ label, value, hint }) {
  return (
    <article className="stat-card">
      <p>{label}</p>
      <h3>{value}</h3>
      <span>{hint}</span>
    </article>
  );
}

export default function DashboardPage() {
  const dispatch = useDispatch();

  const profileState = useSelector((state) => state.profile);
  const bookingState = useSelector((state) => state.interview.myBookings);
  const slotState = useSelector((state) => state.interview.mySlots);
  const requestState = useSelector((state) => state.interview.incomingRequests);

  useEffect(() => {
    if (profileState.status === 'idle') {
      dispatch(fetchMyProfile());
    }

    if (bookingState.status === 'idle') {
      dispatch(fetchMyBookings());
    }

    if (slotState.status === 'idle') {
      dispatch(fetchMySlots());
    }

    if (requestState.status === 'idle') {
      dispatch(fetchIncomingBookingRequests('PENDING'));
    }
  }, [
    bookingState.status,
    dispatch,
    profileState.status,
    requestState.status,
    slotState.status,
  ]);

  const stats = useMemo(
    () => [
      {
        label: 'Profile status',
        value: profileState.profile ? 'Ready' : 'Pending',
        hint: profileState.profile
          ? 'Your onboarding profile is saved.'
          : 'Create your profile to complete onboarding.',
      },
      {
        label: 'My bookings',
        value: bookingState.items.length,
        hint: 'Interviews you booked as a participant.',
      },
      {
        label: 'My slots',
        value: slotState.items.length,
        hint: 'Availability slots you own.',
      },
      {
        label: 'Pending requests',
        value: requestState.items.filter((item) => item.bookingStatus === 'PENDING').length,
        hint: 'Incoming requests waiting for your confirmation.',
      },
    ],
    [bookingState.items.length, profileState.profile, requestState.items, slotState.items.length],
  );

  const isBusy =
    profileState.status === 'loading' &&
    bookingState.status === 'idle' &&
    slotState.status === 'idle';

  if (isBusy) {
    return <Loader label="Loading your dashboard..." />;
  }

  if (
    profileState.status === 'failed' &&
    !profileState.notFound &&
    profileState.error
  ) {
    return (
      <ErrorBlock
        title="Dashboard unavailable"
        message={profileState.error.message}
        action={
          <button
            type="button"
            className="button button--primary"
            onClick={() => dispatch(fetchMyProfile())}
          >
            Retry
          </button>
        }
      />
    );
  }

  return (
    <div className="stack-lg">
      <section className="hero-card">
        <div>
          <p className="eyebrow">Overview</p>
          <h1>Your interview workspace</h1>
          <p>
            Manage onboarding, discover interviewers, confirm bookings, and jump into ready sessions from one place.
          </p>
        </div>
        <div className="hero-card__actions">
          <Link to="/profile" className="button button--primary">
            {profileState.profile ? 'Update profile' : 'Create profile'}
          </Link>
          <Link to="/interviewers" className="button button--ghost">
            Find interviews
          </Link>
        </div>
      </section>

      <section className="stat-grid">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <section className="content-grid">
        <article className="card">
          <div className="card__header">
            <div>
              <p className="eyebrow">Next step</p>
              <h2>Recommended actions</h2>
            </div>
          </div>

          <div className="stack">
            {!profileState.profile ? (
              <div className="inline-note inline-note--warning">
                Create your profile first so other users can see your professional details.
              </div>
            ) : null}

            <Link to="/profile" className="list-row">
              <div>
                <strong>Profile</strong>
                <p>Manage onboarding details and skills.</p>
              </div>
              <span>Open</span>
            </Link>

            <Link to="/interviewers" className="list-row">
              <div>
                <strong>Marketplace</strong>
                <p>Search interviewers and book open slots.</p>
              </div>
              <span>Open</span>
            </Link>

            <Link to="/slots" className="list-row">
              <div>
                <strong>Availability</strong>
                <p>Create slots and review incoming booking requests.</p>
              </div>
              <span>Open</span>
            </Link>

            <Link to="/bookings" className="list-row">
              <div>
                <strong>Bookings</strong>
                <p>Track the interviews you have booked.</p>
              </div>
              <span>Open</span>
            </Link>
          </div>
        </article>

        <article className="card">
          <div className="card__header">
            <div>
              <p className="eyebrow">Highlights</p>
              <h2>Quick workspace summary</h2>
            </div>
          </div>

          <div className="stack">
            <div className="list-row">
              <div>
                <strong>{profileState.profile ? 'Profile completed' : 'Profile pending'}</strong>
                <p>
                  {profileState.profile
                    ? 'Your public profile is ready for marketplace visibility.'
                    : 'Complete your profile to unlock a stronger presence in the platform.'}
                </p>
              </div>
              <span>{profileState.profile ? 'Ready' : 'Pending'}</span>
            </div>

            <div className="list-row">
              <div>
                <strong>{bookingState.items.length} booked interviews</strong>
                <p>Review confirmed sessions and join them directly from your bookings page.</p>
              </div>
              <span>Bookings</span>
            </div>

            <div className="list-row">
              <div>
                <strong>{slotState.items.length} created slots</strong>
                <p>Manage your time blocks and keep your interview availability updated.</p>
              </div>
              <span>Slots</span>
            </div>

            <div className="list-row">
              <div>
                <strong>
                  {requestState.items.filter((item) => item.bookingStatus === 'PENDING').length}{' '}
                  pending requests
                </strong>
                <p>Respond quickly to booking requests to keep your schedule active.</p>
              </div>
              <span>Requests</span>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}