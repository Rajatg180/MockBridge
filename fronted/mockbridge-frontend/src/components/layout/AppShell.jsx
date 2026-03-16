import { useState } from 'react';
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleLogout = async () => {
    closeSidebar();
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
      <div
        className={`sidebar-backdrop ${isSidebarOpen ? 'sidebar-backdrop--open' : ''}`}
        onClick={closeSidebar}
        aria-hidden={!isSidebarOpen}
      />

      <aside className={`sidebar ${isSidebarOpen ? 'sidebar--open' : ''}`}>
        <div className="brand-block">
          <div className="brand-badge">MB</div>
          <div>
            <h1>MockBridge</h1>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Primary">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={closeSidebar}
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
          <div className="page-topbar__left">
            <button
              type="button"
              className="menu-toggle"
              onClick={() => setIsSidebarOpen((current) => !current)}
              aria-label={isSidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isSidebarOpen}
            >
              {isSidebarOpen ? (
                <svg
                  viewBox="0 0 24 24"
                  width="22"
                  height="22"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    d="M6 6L18 18M18 6L6 18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  width="22"
                  height="22"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    d="M4 7H20M4 12H20M4 17H20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </button>

            <div>
              <h2>Welcome back</h2>
            </div>
          </div>
        </header>

        <section className="page-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}