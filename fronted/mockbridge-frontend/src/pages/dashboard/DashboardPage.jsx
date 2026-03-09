import { Link } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { PageHeader } from '../../components/ui/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatUtcToLocal } from '../../lib/date';

export function DashboardPage() {
  const authUser = useAppSelector((state) => state.auth.user);
  const profile = useAppSelector((state) => state.profile.profile);
  const workspace = useAppSelector((state) => state.interviews.workspace);

  const stats = [
    { label: 'Role', value: authUser?.role || 'USER' },
    { label: 'Skills', value: profile?.skills?.length || 0 },
    { label: 'Recent bookings', value: workspace.bookings.length },
    { label: 'Recent sessions', value: workspace.sessions.length },
  ];

  return (
    <div className="stack-lg">
      <PageHeader
        title={`Welcome, ${profile?.fullName || authUser?.email}`}
        description="This dashboard is backed by your current services and stays within the exact API surface you shared."
        actions={
          <div className="inline-actions">
            <Link className="button button-secondary" to="/slots/open">Browse slots</Link>
            <Link className="button button-primary" to="/slots/create">Create slot</Link>
          </div>
        }
      />

      <section className="stats-grid">
        {stats.map((item) => (
          <article key={item.label} className="card stat-card">
            <p className="label">{item.label}</p>
            <h3>{item.value}</h3>
          </article>
        ))}
      </section>

      <section className="grid two-columns">
        <article className="card stack">
          <div>
            <h3>Profile summary</h3>
            <p className="muted">Pulled from `/users/me`.</p>
          </div>
          <div className="detail-list">
            <div><span>Email</span><strong>{profile?.email}</strong></div>
            <div><span>Headline</span><strong>{profile?.headline || '-'}</strong></div>
            <div><span>Experience</span><strong>{profile?.yearsOfExperience || 0} years</strong></div>
            <div><span>Average rating</span><strong>{profile?.averageRating || 0}</strong></div>
          </div>
          <div className="chip-row">
            {(profile?.skills || []).map((skill) => (
              <span key={skill.id} className="chip">{skill.skillName} · {skill.proficiency}</span>
            ))}
          </div>
          <Link className="button button-secondary" to="/profile">Manage profile</Link>
        </article>

        <article className="card stack">
          <div>
            <h3>Known API-powered flows</h3>
            <p className="muted">These are fully supported by your current backend.</p>
          </div>
          <div className="list-card">
            <Link to="/interviewers/search">Search interviewers by skill</Link>
            <Link to="/slots/open">Book an open slot</Link>
            <Link to="/slots/create">Publish a new availability slot</Link>
            <Link to="/workspace">Confirm booking or fetch session by booking ID</Link>
          </div>
        </article>
      </section>

      <section className="grid two-columns">
        <article className="card stack">
          <div>
            <h3>Recent bookings</h3>
            <p className="muted">Stored locally because the backend does not yet expose `GET /bookings/me`.</p>
          </div>
          {workspace.bookings.length ? (
            <div className="stack-sm">
              {workspace.bookings.map((booking) => (
                <div key={booking.bookingId} className="list-item">
                  <div>
                    <strong>{booking.bookingId}</strong>
                    <p className="muted">Slot: {booking.slotId}</p>
                  </div>
                  <span className="chip">{booking.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No recent bookings" description="Book a slot to populate the booking workspace." />
          )}
        </article>

        <article className="card stack">
          <div>
            <h3>Recent sessions and slots</h3>
            <p className="muted">Recent actions from this browser are persisted locally.</p>
          </div>

          <div className="stack-sm">
            {(workspace.sessions || []).slice(0, 3).map((session) => (
              <div key={session.sessionId} className="list-item">
                <div>
                  <strong>{session.roomId}</strong>
                  <p className="muted">Booking: {session.bookingId}</p>
                </div>
                <span className="chip">{session.sessionStatus}</span>
              </div>
            ))}
            {(workspace.createdSlots || []).slice(0, 3).map((slot) => (
              <div key={slot.id} className="list-item">
                <div>
                  <strong>{formatUtcToLocal(slot.startTimeUtc)}</strong>
                  <p className="muted">Slot ID: {slot.id}</p>
                </div>
                <span className="chip">{slot.status}</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
