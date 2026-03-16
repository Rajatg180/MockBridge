import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { logoutUser } from '../../features/auth/authSlice';
import { resetProfileState } from '../../features/profile/profileSlice';
import { resetInterviewState } from '../../features/interview/interviewSlice';
import { addToast } from '../../features/ui/uiSlice';
import { clearActiveSessionRoom } from '../../utils/sessionRoomStorage';

const navItems = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Profile', to: '/profile' },
  { label: 'Find Interviews', to: '/interviewers' },
  { label: 'Manage Slots', to: '/slots' },
  { label: 'My Bookings', to: '/bookings' },
];

export default function AppShell() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, status } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    dispatch(resetProfileState());
    dispatch(resetInterviewState());
    clearActiveSessionRoom();
    dispatch(
      addToast({
        type: 'success',
        title: 'Signed out',
        message: 'You have been logged out safely.',
      }),
    );
    navigate('/login', { replace: true });
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-badge">MB</div>
          <div>
            <h1>MockBridge</h1>
            <p>Mock interview workflow</p>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Primary">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'sidebar-link--active' : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-panel">
            <span className="badge">{user?.role || 'USER'}</span>
            <div>
              <strong>{user?.email || 'Signed in user'}</strong>
              <p>Authenticated through gateway</p>
            </div>
          </div>

          <button
            type="button"
            className="button button--ghost button--full"
            onClick={handleLogout}
            disabled={status === 'signingOut'}
          >
            {status === 'signingOut' ? 'Signing out...' : 'Sign out'}
          </button>
        </div>
      </aside>

      <main className="main-shell">
        <header className="page-topbar">
          <div>
            <p className="eyebrow">Microservice frontend</p>
            <h2>Welcome back</h2>
          </div>
          <div className="topbar-note">
            Gateway-authenticated workspace with profile, booking, and session flows.
          </div>
        </header>

        <section className="page-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
